let arr = [1, 2, 3, 3, 4, 5, 6, 7, 8, 9, 0];
let v = [];
let x;
for (let i = 0; i < 6; i++) {
  v[i] = arr[Math.floor(Math.random() * arr.length)];
  x = v.join("");
}