/**
 * Parses CSV and outputs the category/subcategory structure
 * CSV format: Row 1 = category names (columns), Rows 2+ = subcategories per column
 */
const csvContent = `ביגוד והנעלה,ביטוחים,בילויים ופנאי,בריאות,דיור,הכנסה,חיות,חיסכון,מנויים,צריכה,קניות אונליין,תחבורה (רכב),תחבורה (אופנוע),תחבורה ציבורית,אסתטיקה ויופי,אחר
-- אין תת קגטוריה --,ביטוח בריאות,-- אין תת קגטוריה --,קופת חולים,מים,הכנסות עידן,הוצאות דגים,יעד ארוך טווח,Disney+,אוכל,Shein,דלק,דלק,אוטובוס / רכבת,גבות,-- אין תת קטגוריה --
,ביטוח חיים,,שיניים,ארנונה,הכנסות ספיר,הוצאות דייזי,,Netflix,טואלטיקה/היגיינה,AliExpress,חניה,חניה,מונית,לק ג'ל,
,אחר,,אחר,ועד בית,אחר,,,TV,אחר,Temu,תחזוקה,תחזוקה,אחר,פדיקור,
,,,,גז,,,,מצלמות אבטחה,,iHerb,טסט,טסט,,הסרת שיער,
,,,,שכירות / משכנתא,,,,GPT,,אחר,ביטוח,ביטוח,,,
,,,,ביטוח מבנה,,,,Cursor,,,אחר,אחר,,,
,,,,תמי 4,,,,Google Drive,,,,,,,
,,,,אינטרנט,,,,אפליקציות,,,,,,,
,,,,חשמל,,,,אחר,,,,,,,
,,,,ריהוט,,,,פעילות גופנית,,,,,,,
,,,,אחר,,,,טלפון נייד,,,,,,,
,,,,,,,,PS5,,,,,,,
,,,,,,,,iCloud,,,,,,,`;

const SKIP = ['-- אין תת קגטוריה --', '-- אין תת קטגוריה --'];

function parseCSV(content: string): Record<string, string[]> {
  const lines = content.trim().split('\n');
  const header = lines[0].split(',');
  const categories = header.map((h) => h.trim());
  const result: Record<string, string[]> = {};

  for (let col = 0; col < categories.length; col++) {
    const cat = categories[col];
    if (!cat) continue;
    result[cat] = [];

    for (let row = 1; row < lines.length; row++) {
      const cells = lines[row].split(',');
      const val = (cells[col] || '').trim();
      if (val && !SKIP.includes(val) && !result[cat].includes(val)) {
        result[cat].push(val);
      }
    }
  }

  return result;
}

const parsed = parseCSV(csvContent);
console.log(JSON.stringify(parsed, null, 2));
