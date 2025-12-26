# Supabase Setup Guide for Todo List

## 1. Create the Tasks Table

Go to your Supabase dashboard and create a new table called `tasks` with these columns:

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'personal',
  due_date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX tasks_user_id_idx ON tasks(user_id);
```

## 2. Set Row Level Security (RLS)

Enable RLS on the tasks table and add this policy:

```sql
CREATE POLICY "Users can manage their own tasks"
ON tasks
FOR ALL
USING (auth.uid()::text = user_id OR user_id LIKE 'user-%');
```

## 3. Test Connection

Your TodoList component should now:
- ✅ Load tasks from Supabase when the page loads
- ✅ Add new tasks to the database
- ✅ Update task completion status
- ✅ Delete tasks from the database

The app uses a temporary `user-id` stored in localStorage for testing. Later, you can integrate real authentication with `supabase.auth`.

## Alternative: Using SQL Editor in Supabase

Instead of writing SQL, you can use the Supabase dashboard:
1. Click "New Table" in the SQL editor
2. Name it `tasks`
3. Add columns manually with the UI
4. Enable RLS
5. Add the policy from above
