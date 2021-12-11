const sum = (a, b) => {
  if (a && b) return a + b;
  throw new Error('Invalid arguments');
};
try {
  console.log(sum(1));
} catch {
  console.log('error occured');
}
conosle.log('continue the execution');
