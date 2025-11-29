import fs from 'fs';
import path from 'path';
import type { ProcessedData } from '../../lib/types/processed';
import { DairyAcrossChannels } from 'components/DairyAcrossChannels';
import { MilkAcrossChannels } from 'components/MilkAcrossChannels';

export default function DairyPage() {
  const filePath = path.join(process.cwd(), 'public', 'data', 'processed', 'dairy_eda.json');
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw) as ProcessedData;

  return <>
    <DairyAcrossChannels data={data} height={600} />
    <MilkAcrossChannels data={data} height={600} /></>;
}
