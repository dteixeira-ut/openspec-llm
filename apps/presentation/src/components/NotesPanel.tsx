interface NotesPanelProps {
  notes: string | undefined
}

export function NotesPanel({ notes }: NotesPanelProps) {
  if (!notes) return null
  return (
    <div className="w-full max-w-4xl rounded-xl border border-ut-blue/30 bg-white/5 backdrop-blur-sm px-8 py-5">
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-ut-blue">
        Speaker Notes
      </p>
      <p className="text-white/70 leading-relaxed">{notes}</p>
    </div>
  )
}
