const fs = require('fs');
const readCsv = require('./read-csv');

const spellsPath = './tools/spells.json'; 
const csvPath = './tools/method_updates.csv';

if (!fs.existsSync(csvPath)) {
  console.log(`未找到增量更新文件 ${csvPath}，跳过更新。`);
  process.exit(0);
}

// 1. 类型中文映射表
const typeMap = {
  '野怪': 'map',
  '大型': 'raid',
  '迷宫': 'dungeon',
  '讨伐': 'trail',
  'fate': 'fate',
  '文本': 'special',
  '寻宝': 'treasure',
  '行会令': 'guildhests',
  '狩猎': 'hunt',
  '假面狂欢': 'carnivale',
  '理符': 'levequests',
  '职业任务': 'jobquest'
};

// 2. 颜色中文映射表
const colorMap = {
  '金': 'yellow',
  '红': 'red',
  '灰': 'grey'
};

const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf-8'));
const csvContent = fs.readFileSync(csvPath, 'utf-8');

// --- 修改：在字段末尾追加 status ---
const fields = ['no', 'operation', 'pos', 'type', 'position', 'rank', 'map', 'name', 'mob', 'level', 'note', 'color', 'status'];
const updates = readCsv(csvContent, fields);

// 如果第一行是表头，将它剔除，我们在写回时会重新生成标准表头
if (updates.length > 0 && updates[0].no && updates[0].no.toLowerCase() === 'no') {
  updates.shift();
}

let modified = false;

// 3. 执行更新逻辑并记录状态
for (let i = 0; i < updates.length; i++) {
  const row = updates[i];
  
  if (!row.no) continue; // 彻底的空行跳过
  if (!row.operation) {
    row.status = '失败：缺少 operation (+ 或 -)';
    continue;
  }

  const spellNo = Number(row.no);
  const spell = spellsData.find(s => Number(s.no) === spellNo);

  if (!spell) {
    row.status = `失败：未找到技能 #${spellNo}`;
    console.warn(`[警告] 技能 #${spellNo} 不存在。`);
    continue;
  }

  if (!Array.isArray(spell.method)) {
    spell.method = [];
  }

  let pos = row.pos ? Number(row.pos) : 0;

  if (row.operation === '+') {
    const newMethod = {};
    
    if (row.type) {
      const rawType = row.type.trim();
      newMethod.type = typeMap[rawType] || rawType;
    }
    if (row.position) {
      newMethod.position = row.position.split(',').map(n => Number(n.trim()));
    }
    if (row.rank) {
      newMethod.rank = row.rank;
    } else if (newMethod.type === 'map') { 
      newMethod.rank = null; 
    }
    if (row.map) newMethod.map = row.map;
    if (row.name) newMethod.name = row.name;
    if (row.mob) newMethod.mob = row.mob;
    if (row.level) newMethod.level = Number(row.level);
    if (row.note) newMethod.note = row.note;
    if (row.color) {
      const rawColor = row.color.trim();
      newMethod.color = colorMap[rawColor] || rawColor;
    }

    spell.method.splice(pos, 0, newMethod);
    row.status = `成功：已在第 ${pos} 项后插入新途径 (${newMethod.type || '未指定'})`;
    modified = true;
    console.log(`[新增] 技能 #${spellNo} 插入成功。`);
    
  } else if (row.operation === '-') {
    const indexToDelete = pos > 0 ? pos - 1 : 0;
    
    if (indexToDelete >= 0 && indexToDelete < spell.method.length) {
      spell.method.splice(indexToDelete, 1);
      row.status = `成功：第 ${pos} 项途径已被删除`;
      modified = true;
      console.log(`[删除] 技能 #${spellNo} 删除成功。`);
    } else {
      row.status = `失败：越界，该技能只有 ${spell.method.length} 种途径`;
      console.warn(`[失败] 技能 #${spellNo} 无法删除第 ${pos} 项。`);
    }
  } else {
    row.status = `失败：未知的操作符 '${row.operation}'`;
  }
}

// 4. 将对象数组转回 CSV 字符串的辅助函数
function stringifyCsv(data, fieldList) {
  const header = fieldList.join(',');
  const rows = data.map(row => {
    return fieldList.map(field => {
      let val = row[field] === undefined || row[field] === null ? '' : String(row[field]);
      // 如果内容包含逗号、换行符或双引号，必须用双引号将其包裹，并将内部的双引号转义为两个双引号
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    }).join(',');
  });
  return [header, ...rows].join('\n');
}

// 5. 保存修改
if (modified) {
  // 写回 spells.json
  fs.writeFileSync(spellsPath, JSON.stringify(spellsData, null, 2), 'utf-8');
  console.log('🎉 增量更新已合并到 spells.json！');
}

// 无论是否有内容更新，都写回状态到 CSV 中
const finalCsvContent = stringifyCsv(updates, fields);
fs.writeFileSync(csvPath, finalCsvContent, 'utf-8');
console.log('📝 执行状态已回写到 method_updates.csv 中！');
