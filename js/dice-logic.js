/* Regras puras da mesa de dados. Mantidas separadas para QA sem navegador. */
(function(global,factory){
  const api=factory();
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  global.RPGDiceLogic=api;
})(globalThis,function(){
  function digit(value){
    const numeric=Number(value);
    if(!Number.isFinite(numeric))return 0;
    return Math.abs(Math.trunc(numeric))%10;
  }

  function percentileFromComponents(tens,units){
    const tensInput=Math.abs(Math.trunc(Number(tens)||0));
    const tensValue=Math.max(0,Math.min(90,Math.floor(tensInput/10)*10));
    const unitsValue=digit(units);
    const value=tensValue+unitsValue||100;
    return {tens:tensValue,units:unitsValue,value,tensText:String(tensValue).padStart(2,'0')};
  }

  function percentileFromRawDice(tensDie,unitsDie){
    return percentileFromComponents(digit(tensDie)*10,digit(unitsDie));
  }

  function rollPercentile(random=Math.random){
    return percentileFromComponents(Math.floor(random()*10)*10,Math.floor(random()*10));
  }

  function percentileDetail(result){
    return `${result.tensText} + ${result.units} = ${result.value}`;
  }

  return {digit,percentileFromComponents,percentileFromRawDice,rollPercentile,percentileDetail};
});
