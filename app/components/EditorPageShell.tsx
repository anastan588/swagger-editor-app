import { EditorWorkspace } from '@/app/components/EditorWorkspace';
import { SchemaProvider } from '@/app/context/SchemaContext';
import { createClient } from '@/lib/supabase/server';

export const EditorPageShell = async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialSchema = '';

  if (user) {
    const { data } = await supabase.from('schemas').select('content').eq('user_id', user.id).maybeSingle();

    if (data?.content) {
      initialSchema = data.content;
    }
  }

  return (
    <SchemaProvider initialSchema={initialSchema}>
      <div className="h-[calc(100vh-112px)] min-h-0 w-full overflow-hidden bg-white dark:bg-black">
        <EditorWorkspace />
      </div>
    </SchemaProvider>
  );
};
