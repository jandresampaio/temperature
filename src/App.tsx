import "./App.css";
import "react-toastify/dist/ReactToastify.css";
import Chart from "./Components/Chart/Chart";
import logo from "./logo.svg";

function App() {
  return (
    <div className="App">
      <div className="App-title">
        <img src={logo} className="app-logo" alt="logo" />
        <header className="temperatures-header">Temperature Monitoring </header>
      </div>
      <Chart />
    </div>
  );
}

export default App;
