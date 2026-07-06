import { redirect } from 'next/navigation';

import { EditorWorkspace } from '@/app/components/EditorWorkspace';
import { SchemaProvider } from '@/app/context/SchemaContext';
import { createClient } from '@/lib/supabase/server';

export default async function EditorPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/sign-in');
  }

  let initialSchema = '';
  const { data } = await supabase.from('schemas').select('content').eq('user_id', user.id).maybeSingle();

  if (data?.content) {
    initialSchema = data.content;
  }

  return (
    <SchemaProvider initialSchema={initialSchema}>
      <div className="w-full h-[calc(100vh-112px)] min-h-0 overflow-hidden bg-white dark:bg-black">
        <EditorWorkspace />
      </div>
    </SchemaProvider>
  );
}
