// Stand-in for a photo that has not been taken yet: a blank engineering
// drawing sheet with zone marks and a title block.
const COLUMNS = ['1', '2', '3', '4', '5', '6', '7', '8']
const ROWS = ['A', 'B', 'C', 'D']

export function DrawingSheet({ number, label = 'Photo' }: { number: string; label?: string }) {
  return (
    <div className="sheet" aria-hidden="true">
      <div className="sheet__frame">
        <div className="sheet__zones sheet__zones--x">
          {COLUMNS.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
        <div className="sheet__zones sheet__zones--y">
          {ROWS.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </div>
        <span className="sheet__mark" />
        <dl className="sheet__block">
          <div>
            <dt>Drg no.</dt>
            <dd>EJS-{number}</dd>
          </div>
          <div>
            <dt>View</dt>
            <dd>{label}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>To follow</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}
