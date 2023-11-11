
// ラジアンに変換
function radian(val) {
  return (val * Math.PI) / 180;
}

// ランダムな数
function random(min, max) {
  return Math.random() * (max - min) + min;
}

// 線形補間
function lerp(x, y, a) {
  return (1 - a) * x + a * y;
}

function noise(x, y, z) {
  // ノイズ生成の実際の関数をここで適用します。
  return (Math.random() - 0.5) * 2.0;
}

export {radian, random, lerp, noise};