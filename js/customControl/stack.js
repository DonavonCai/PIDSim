// Stack class shamelessly stolen from here:
// https://medium.com/better-programming/implementing-a-stack-in-javascript-73d1aa0483c1
class Stack {
  constructor(){
    this.data = [];
    this.top = 0;
  }
  push(element) {
    this.data[this.top] = element;
    this.top = this.top + 1;
  }
  length() {
    return this.top;
  }
  isEmpty() {
    return this.top === 0;
  }
  peek() {
    return this.data[this.top -1 ];
  }
  pop() {
    if( this.isEmpty() === false ) {
      this.top = this.top -1;
      return this.data.pop();
    }
  }
  clear() {
    this.data = [];
    this.top = 0;
  }
}