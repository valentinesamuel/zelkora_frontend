import { AppRouter } from './app/router/AppRouter';
import { AuthBootstrap } from './features/auth/AuthBootstrap';

function App() {
  return (
    <>
      <AuthBootstrap />
      <AppRouter />
    </>
  );
}

export default App;
