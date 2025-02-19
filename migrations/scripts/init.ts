
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

interface InitializationConfig {
  supabaseUrl: string;
  supabaseKey: string;
}

async function initializeDatabase(config: InitializationConfig) {
  const supabase = createClient(config.supabaseUrl, config.supabaseKey);

  const steps = [
    { name: '01_types.sql', description: 'Creating custom types' },
    { name: '02_tables.sql', description: 'Creating tables' },
    { name: '03_functions.sql', description: 'Creating functions' },
    { name: '04_triggers.sql', description: 'Setting up triggers' },
    { name: '05_policies.sql', description: 'Configuring RLS policies' },
    { name: '06_seed.sql', description: 'Seeding initial data' },
  ];

  for (const step of steps) {
    console.log(`Executing ${step.description}...`);
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'schema', step.name),
      'utf8'
    );
    
    const { error } = await supabase.rpc('exec_sql', { sql });
    if (error) {
      console.error(`Error in ${step.name}:`, error);
      throw error;
    }
    console.log(`Completed ${step.description}`);
  }

  console.log('Database initialization completed successfully');
}

export { initializeDatabase };
