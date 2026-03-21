const fs = require('fs');
const path = require('path');

const dbContent = fs.readFileSync(path.join(__dirname, '../types/database.ts'), 'utf-8');

const regex = /\/\/ Table (\w+)\nexport interface (\w+) \{[\s\S]*?export interface (\w+) \{/g;

let tables = '';
let match;
while ((match = regex.exec(dbContent)) !== null) {
  const tableName = match[1];
  const rowType = match[2];
  const inputType = match[3];

  tables += `      ${tableName}: {\n`;
  tables += `        Row: DB.${rowType} & Record<string, unknown>\n`;
  tables += `        Insert: DB.${inputType} & Record<string, unknown>\n`;
  tables += `        Update: Partial<DB.${inputType}> & Record<string, unknown>\n`;
  tables += `        Relationships: []\n`;
  tables += `      }\n`;
}

// Notice the [key: string] replaced with [_ in never]: never for empty structures
const outContent = `import * as DB from './database'

export type Database = {
  public: {
    Tables: {
${tables}    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
`;

fs.writeFileSync(path.join(__dirname, '../types/supabase.ts'), outContent);
console.log('Successfully generated types/supabase.ts');
