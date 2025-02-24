
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import { TourProvider } from "./components/onboarding/TourContext";
import Routes from './Routes';
import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <TourProvider>
          <Routes />
          <Toaster />
          </TourProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
