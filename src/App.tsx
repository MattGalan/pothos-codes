import "@mantine/core/styles.css";
import "./App.css";
import { MantineProvider, TextInput, createTheme } from "@mantine/core";

const theme = createTheme({});

export default function App() {
  return (
    <MantineProvider theme={theme}>
      <TextInput label="Common name" />
    </MantineProvider>
  );
}
