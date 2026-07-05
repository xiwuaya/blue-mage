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

// --- 新增：颜色中文映射表 ---
const colorMap = {
  '金': 'yellow',
  '红': 'red',
  '灰': 'grey'
};

const spellsData = JSON.parse(fs.readFileSync(spellsPath, 'utf-8'));
const csvContent = fs.readFileSync(csvPath, 'utf-8');

const fields = ['no', 'operation', 'pos', 'type', 'position', 'rank', 'map', 'name', 'mob', 'level', 'note', 'color'];
const updates = readCsv(csvContent, fields);

if (updates.length > 0 && updates[0].no.toLowerCase() === 'no') {
  updates.shift();
}

for (let i = 0; i < updates.length; i++) {
  const row = updates[i];
  if (!row.no || !row.operation) continue;

  const spellNo = Number(row.no);
  const spell = spellsData.find(s => Number(s.no) === spellNo);

  if (!spell) {
    console.warn(`[警告] 第 ${i + 2} 行：未找到技能编号 ${spellNo}，跳过此条。`);
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
    
    // --- 修改：读取 color 并执行映射转换 ---
    if (row.color) {
      const rawColor = row.color.trim();
      // 如果映射表里有这个中文，就转为设定的英文；如果没有，就保持原样
      newMethod.color = colorMap[rawColor] || rawColor;
    }

    spell.method.splice(pos, 0, newMethod);
    console.log(`[新增] 技能 #${spellNo}：已在第 ${pos} 项后插入新途径 (${newMethod.type})。`);
    
  } else if (row.operation === '-') {
    const indexToDelete = pos > 0 ? pos - 1 : 0;
    
    if (indexToDelete >= 0 && indexToDelete < spell.method.length) {
      spell.method.splice(indexToDelete, 1);
      console.log(`[删除] 技能 #${spellNo}：第 ${pos} 项获取途径已被移除。`);
    } else {
      console.warn(`[失败] 技能 #${spellNo}：无法删除第 ${pos} 项，越界。`);
    }
  }
}

fs.writeFileSync(spellsPath, JSON.stringify(spellsData, null, 2), 'utf-8');
console.log('🎉 增量更新已成功合并到 spells.json 中！');
