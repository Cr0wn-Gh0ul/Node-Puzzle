const fs = require('fs');
const gm = require('gm').subClass({imageMagick: true});

/*
    ~ REQUIRES FILE TO ENCRYPT IN HEX BYTE ARRAY ~
    echo "["$(xxd -p [FILENAME] | tr -d '\n' | sed "s/.\{2\}/'&', /g")"]"
*/
const Secret = ['DE','AD','C0','FF','EE'];

const Tree = new CaesarTree(Secret);
Tree.enc();

class CaesarTree {
  constructor(s) {
    this.s         = s;
    this.r         = [];
    this.n         = [];
    this.c         = [];
    this.i         = 1;
    this.k         = [];
  }

  enc() {
    this.k.push(this.s[0])
    this.r.push([this.s[0]]);
    for (let i = 1; i < this.s.length; i++) {
      this.A(this.s[i]);
    }

    if (this.c.length !== 0) {
        this.c.push('NULL');
        this.n.push(this.c);
    }
    if (this.n.length !== 0) {
      if(this.n[this.n.length - 1].length !== 2) {
        this.n[this.n.length - 1][1] = 'NULL';
      }
      let P = this.i - this.n.length;
      for (let p = 0; p < P; p++) {
        this.n.push(['NULL','NULL']);
      }
      this.r.push(this.n);
    }
  }

  A(N) {
    let C = this.S(this.k[0], N);
    this.c.push(C);
    if (this.c.length == 2) {
      this.k.shift();
      this.n.push(this.c);
      this.c = [];
    }

    if (this.n.length === this.i) {
      this.r.push(this.n);
      for ( let i = 0; i < this.n.length; i++) {
        this.k.push(this.n[i][0], this.n[i][1]);
      }
      this.n = [];
      this.i = this.i * 2;
    }
  }

  M(n, m) {
    return ((n % m) + m) % m;
  }

  S(k,p) {
    let M = parseInt(k, 16) + parseInt(p, 16);
    let C = this.M(M, 256);
    C = C.toString(16);
    if (C.length < 2) {
        C = '0' + C;
    }
    return C;
  }
}

const x = 70000;
const y = 700;
const c = (x / 2);
const t = 50;

const img = gm(x, y, "#000000");
let col1 = "#"+Tree.r[0]+"ffff";
img.fill(col1).drawCircle(c, t, (c + 4), (t + 4));

let prevXY = [[c,t]];
let X = c;
let z = 1;
for ( let i = 1; i < Tree.r.length; i++) {

  let T = (i+1) * t;
  let Nodes = Tree.r[i];
  let iXY = [];

  for (let I = 0; I < Nodes.length; I++) {

    if(Nodes[I][0] == 'NULL' || Nodes[I][0] == 'NULL') { break }

    let color1 = "#"+Nodes[I][0]+'ffff';
    let color2 = "#"+Nodes[I][1]+'ffff';

    let point = X * z;
    let space = X / 2;

    X1 = point - space;
    X2 = point + space;

    img.stroke("#FFFFFF").drawLine(prevXY[I][0], prevXY[I][1] + 4, X1, T);
    img.stroke("#FFFFFF").drawLine(prevXY[I][0], prevXY[I][1] + 4, X2, T)
    img.fill(color1).drawCircle(X1, T, (X1 + 4), (T + 4));
    img.fill(color2).drawCircle(X2, T, (X2 - 4), (T + 4));

    z = z + 2;
    iXY.push([X1, T], [X2, T]);
  }

  prevXY = iXY;
  iXY = [];
  X = (X / 2);
  z = 1;
}

img.write("./Puzzle.png", function (err) {
  if (err) { console.log(err) }
});
