
jsx
function Hello({ name }) {
  return <h1>Hello, {name}</h1>;
}



jsx
const [count, setCount] = useState(0);



jsx
useEffect(() => {
  // runs after render
}, [dependencies]);
