#!/usr/bin/env python3
"""Generate a self-contained review picker from a saved candidate JSON snapshot."""
import argparse
import copy
import datetime
import hashlib
import html
import json
from pathlib import Path
import re
from urllib.parse import urlsplit


def normalize(data):
    if not isinstance(data, (dict, list)):
        raise ValueError('Input must be an object or array of candidates.')
    meta = data if isinstance(data, dict) else {}
    raw = data if isinstance(data, list) else next((data[k] for k in ('items', 'candidates', 'readyCandidates') if k in data), None)
    if not isinstance(raw, list):
        raise ValueError('Provide items[], candidates[], readyCandidates[], or a candidate array.')
    raw = copy.deepcopy(raw)
    for hold in meta.get('dateHolds', []):
        raw.append({**hold, 'held': True, 'date': None, 'holdReason': hold.get('reason', ''), 'details': hold.get('details', hold.get('reason', '')), 'sources': [hold['source']] if hold.get('source') else hold.get('sources', [])})
    seen = set()
    items = []
    for item in raw:
        if not isinstance(item, dict):
            raise ValueError('Every item must be an object.')
        for field in ('id', 'title'):
            if not isinstance(item.get(field), str) or not item[field].strip():
                raise ValueError(f'Every item needs a nonempty {field}.')
        if item['id'] in seen:
            raise ValueError('Duplicate candidate ID: ' + item['id'])
        seen.add(item['id'])
        details = item.get('details', item.get('summary', ''))
        if not isinstance(details, str) or not details.strip():
            raise ValueError('Missing description for ' + item['id'])
        date = item.get('date')
        if date is not None:
            if not isinstance(date, str) or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', date):
                raise ValueError('Date must be YYYY-MM-DD or null: ' + item['id'])
            datetime.date.fromisoformat(date)
        if 'held' in item and not isinstance(item['held'], bool):
            raise ValueError('held must be boolean: ' + item['id'])
        held = item.get('held', False)
        reason = item.get('holdReason', item.get('reason', ''))
        if not date and not held:
            raise ValueError('Undated items must have held: true: ' + item['id'])
        if held and (not isinstance(reason, str) or not reason.strip()):
            raise ValueError('Held items need a holdReason: ' + item['id'])
        category = item.get('category', 'uncategorized')
        if not isinstance(category, str) or not category.strip():
            raise ValueError('Invalid category: ' + item['id'])
        sources = item.get('sources', [])
        context = item.get('context', [x for x in meta.get('supportingContext', []) if x.get('candidateId') == item['id']])
        if not isinstance(sources, list) or not isinstance(context, list):
            raise ValueError('sources and context must be arrays: ' + item['id'])
        for group in [sources] + [c.get('sources', []) for c in context if isinstance(c, dict)]:
            if not isinstance(group, list):
                raise ValueError('Context sources must be an array.')
            for source in group:
                if not isinstance(source, dict) or not isinstance(source.get('url'), str):
                    raise ValueError('Sources need a URL object: ' + item['id'])
                url = urlsplit(source['url'])
                if url.scheme not in ('http', 'https') or not url.netloc:
                    raise ValueError('Source URLs must be HTTP(S): ' + item['id'])
                if 'verified' in source and not isinstance(source['verified'], bool):
                    raise ValueError('Source verified flag must be boolean.')
        if any(not isinstance(c, dict) or not isinstance(c.get('details', ''), str) for c in context):
            raise ValueError('Context entries must be objects with optional details.')
        if 'significance' in item and not isinstance(item['significance'], str):
            raise ValueError('significance must be a string.')
        items.append({**item, 'date': date, 'category': category, 'details': details, 'held': held, 'holdReason': reason if held else '', 'sources': sources, 'context': context})
    if not items:
        raise ValueError('The candidate list is empty.')
    # Identity includes reviewed facts, not display options. Do not reuse choices after facts change.
    fingerprint = hashlib.sha256(json.dumps(items, sort_keys=True, ensure_ascii=False).encode()).hexdigest()[:20]
    return {'datasetId': fingerprint, 'checkedOn': meta.get('checkedOn'), 'canonicalEvents': meta.get('canonicalEvents'), 'items': items}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--title', default='Candidate review')
    parser.add_argument('--app-label', default='Data review')
    args = parser.parse_args()
    if args.output.exists():
        parser.error('Output already exists. Preserve a reviewed picker; use a new output path.')
    try:
        payload = normalize(json.loads(args.input.read_text()))
    except (ValueError, TypeError, KeyError) as error:
        parser.error(str(error))
    template = (Path(__file__).resolve().parent.parent / 'assets/review.html').read_text()
    total = len(payload['items'])
    held = sum(i['held'] for i in payload['items'])
    replacements = {
        '__TITLE__': html.escape(args.title),
        '__APP_LABEL__': html.escape(args.app_label),
        '__HEADING__': html.escape('Choose what to keep.'),
        '__REVIEW_LABEL__': html.escape('Review / ' + str(payload['checkedOn'])) if payload['checkedOn'] else 'Candidate review',
        '__COMPARISON_LABEL__': f"Deduplicated against {payload['canonicalEvents']} existing records" if isinstance(payload['canonicalEvents'], int) else 'Review candidates before updating your dataset',
        '__COUNTS__': f'{total - held} candidates. {held} awaiting a date.',
        '__TOTAL__': str(total),
    }
    for marker, value in replacements.items():
        template = template.replace(marker, value)
    # Inject JSON last so user content that resembles a template marker remains literal.
    template = template.replace('__DATA__', json.dumps(payload, ensure_ascii=False).replace('<', '\\u003c'))
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(template)
    print(f'Created {args.output}: {total} items, {held} date holds; dataset {payload["datasetId"]}.')


if __name__ == '__main__':
    main()
