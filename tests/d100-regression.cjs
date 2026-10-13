const assert=require('node:assert/strict');
const dice=require('../js/dice-logic.js');

const cases=[
  [0,0,100],
  [0,7,7],
  [30,0,30],
  [40,6,46],
  [90,9,99]
];

for(const [tens,units,expected] of cases){
  const result=dice.percentileFromComponents(tens,units);
  assert.equal(result.value,expected,`${tens}+${units}`);
  assert.ok(result.value>=1&&result.value<=100);
}

/* d10 físico pode expor 10 para a face 0: ambos os dados precisam continuar válidos. */
assert.deepEqual(dice.percentileFromRawDice(10,10),{tens:0,units:0,value:100,tensText:'00'});
assert.equal(dice.percentileFromRawDice(4,6).value,46);

let seed=7;
const deterministic=()=>((seed=(seed*48271)%2147483647)/2147483647);
for(let i=0;i<20;i++){
  const result=dice.rollPercentile(deterministic);
  assert.ok(result.value>=1&&result.value<=100,`rolagem ${i+1}: ${result.value}`);
}

const d100=dice.percentileFromComponents(40,6);
assert.equal(d100.value+2,48,'bônus positivo depois do percentual');
assert.equal(d100.value-3,43,'bônus negativo depois do percentual');
assert.equal(d100.value+4+8,58,'combinação livre: d100 + d6 + d8');
assert.equal(dice.percentileDetail(d100),'40 + 6 = 46');

console.log('d100 regression: 5 casos específicos, 20 rolagens, bônus e combinação aprovados.');
