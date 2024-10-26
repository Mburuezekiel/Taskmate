import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ColorModeScript initialColorMode="light" />
    <ChakraProvider>
      <App />
    </ChakraProvider>
  </StrictMode>
);