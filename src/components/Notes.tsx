import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const noteColor = { primary: '#7B1FA2', light: '#F3E5F5', dark: '#4A148C' };

  // Load notes from Supabase
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (data) {
      setNotes(data.map((n: any) => ({
        id: n.id,
        title: n.title,
        content: n.content,
        createdAt: new Date(n.created_at).getTime(),
        updatedAt: new Date(n.updated_at).getTime(),
      })));
    }
  };

  const createNote = async () => {
    if (title.trim() === '') return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const newNote = {
      user_id: user.id,
      title: title.trim(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('notes').insert([newNote]);
    if (!error) {
      setIsCreating(false);
      setTitle('');
      setContent('');
      loadNotes();
    }
  };

  const updateNote = async () => {
    if (!editingId || title.trim() === '') return;

    const { error } = await supabase
      .from('notes')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', editingId);

    if (!error) {
      setEditingId(null);
      setIsCreating(false);
      setTitle('');
      setContent('');
      loadNotes();
    }
  };

  const deleteNote = async (id: string) => {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) loadNotes();
  };

  const startEdit = (note: Note) => {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
    setIsCreating(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8" style={{ borderTop: '4px solid #7B1FA2' }}>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl" style={{ color: '#4A148C' }}>
          My Notes
        </h3>
        {!isCreating && (
          <button
            onClick={() => {
              setIsCreating(true);
              setEditingId(null);
              setTitle('');
              setContent('');
            }}
            className="px-4 py-2 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#7B1FA2' }}
          >
            <Plus size={20} />
            New Note
          </button>
        )}
      </div>

      {isCreating ? (
        <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-top-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="w-full text-xl font-medium px-4 py-2 rounded-lg border-2 outline-none transition-colors"
            style={{
              borderColor: '#7B1FA2',
              color: '#4A148C',
            }}
            autoFocus
          />
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your thoughts..."
            className="w-full h-48 px-4 py-3 rounded-lg border-2 outline-none resize-none transition-colors"
            style={{
              borderColor: '#E1BEE7',
              color: '#4A148C',
            }}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
              }}
              className="px-6 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors"
              style={{ color: '#666' }}
            >
              <X size={20} />
              Cancel
            </button>
            <button
              onClick={editingId ? updateNote : createNote}
              className="px-6 py-2 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#7B1FA2' }}
            >
              <Save size={20} />
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {notes.length === 0 ? (
            <div className="col-span-full text-center py-12" style={{ color: '#90A4AE' }}>
              <p className="text-lg">No notes yet. Capture your ideas!</p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="p-6 rounded-xl border transition-all hover:shadow-md group relative"
                style={{
                  backgroundColor: noteColor.light,
                  borderColor: 'transparent',
                }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-xl" style={{ color: noteColor.dark }}>
                    {note.title}
                  </h4>
                  <div className="flex gap-1">
                    <button
                      onClick={() => startEdit(note)}
                      className="p-2 rounded-lg transition-colors"
                      style={{ color: noteColor.primary }}
                      aria-label="Edit note"
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(123, 31, 162, 0.1)'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      style={{ color: '#D32F2F' }}
                      aria-label="Delete note"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="whitespace-pre-wrap mb-3" style={{ color: noteColor.dark, opacity: 0.8 }}>
                  {note.content || 'No content'}
                </p>
                <p className="text-xs" style={{ color: '#90A4AE' }}>
                  Updated {new Date(note.updatedAt).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}