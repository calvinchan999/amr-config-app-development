import "./App.css";
import React, { useState, useEffect } from "react";
import { load, dump } from "js-yaml";
import { ChakraProvider } from "@chakra-ui/react";
import {
  FormControl,
  FormLabel,
  Checkbox,
  Input,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  Button,
  Stack,
} from "@chakra-ui/react";
import YmlForm from "./YmlForm";
import VscodeEditor from "./VscodeEditor";

function App() {
  const [yamlValue, setYamlValue] = useState(null);
  const [formElements, setFormElements] = useState([]);
  const [temp, setTemp] = useState(null);
  useEffect(() => {
    const getYaml = async () => {
      const response = await fetch("/api/amr-config");
      const text = await response.text();
      console.log(text);
      setTemp(text);
      setYamlValue(JSON.parse(text));
    };
    getYaml();
  }, []);

  useEffect(() => {
    const parseYamlToForm = (yamlObject, prefix = "") => {
      if (!yamlObject) {
        return [];
      }
      const elements = Object.entries(yamlObject).map(([key, value]) => {
        if (typeof value === "object" && !Array.isArray(value)) {
          const nestedElements = parseYamlToForm(value, `${prefix}${key}|`);

          return (
            <Accordion
              // allowMultiple
              allowToggle
              defaultIndex={[0, 1, 2]}
              borderColor={"transparent"}
              key={`${prefix}${key}`}
            >
              <AccordionItem>
                <h2>
                  <AccordionButton className="form-label">
                    {key}:
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>{nestedElements}</AccordionPanel>
              </AccordionItem>
            </Accordion>
          );
        } else if (typeof value === "string" || typeof value === "number") {
          return (
            <FormControl
              pl={10}
              key={`${prefix}${key}`}
              id={`${prefix}${key}`}
              backgroundColor={"transparent"}
            >
              <FormLabel className="form-label">{key}</FormLabel>
              <Input
                type="text"
                defaultValue={value}
                className="form-label"
                onChange={(event) => {
                  const { value } = event.target;
                  handleChangeValue(`${prefix}${key}`, value);
                }}
              />
            </FormControl>
          );
        } else if (Array.isArray(value)) {
          return (
            <FormControl
              pl={10}
              key={`${prefix}${key}`}
              id={`${prefix}${key}`}
              backgroundColor={"transparent"}
            >
              <FormLabel className="form-label">{key}</FormLabel>
              <Input
                type="text"
                defaultValue={JSON.stringify(value)}
                className="form-label"
                onChange={(event) => {
                  const { value } = event.target;
                  try {
                    const parsedValue = JSON.parse(value);
                    handleChangeValue(`${prefix}${key}`, parsedValue);
                  } catch (error) {
                    console.error(error);
                  }
                }}
              />
            </FormControl>
          );
        } else if (typeof value === "boolean") {
          return (
            <FormControl
              pl={10}
              key={`${prefix}${key}`}
              id={`${prefix}${key}`}
              backgroundColor={"transparent"}
            >
              <Checkbox
                defaultChecked={value}
                className="form-label"
                key={`${prefix}${key}`}
                id={`${prefix}${key}`}
                onChange={(event) => {
                  const { checked } = event.target;
                  console.log(checked);
                  handleChangeValue(`${prefix}${key}`, checked);
                }}
              >
                {key}
              </Checkbox>
            </FormControl>
          );
        } else {
          return null;
        }
      });
      return elements;
    };

    if (yamlValue) {
      const elements = parseYamlToForm(yamlValue);
      setFormElements(elements);
    }
  }, [yamlValue]);

  const handleChangeValue = (key, value) => {
    const keys = key.split("|");
    let obj = yamlValue;
    for (let i = 0; i < keys.length - 1; i++) {
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
    setYamlValue({ ...yamlValue });
  };

  const handleSubmit = () => {
    const jsonToYaml = dump(yamlValue, {
      noCompatMode: true,
      noQuotes: true,
      indent: 2,
      lineWidth: -1,
    });
    console.log(yamlValue);
    console.log(jsonToYaml);
    console.log(JSON.stringify(yamlValue));
    console.log(typeof yamlValue);
    // fs.writeFileSync("/amr-config/application.yml", yamlString);
    fetch("/api/amr-config", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(yamlValue),
    });
  };

  return (
    <ChakraProvider>
      <div className="app-container">
        <div className="chakra-yml-form">
          <YmlForm html={formElements}></YmlForm>
        </div>
        <div className="submit-btn">
          <Stack direction="column">
            <Button colorScheme="red">Reboot</Button>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Save
            </Button>
          </Stack>
        </div>
        {/* <VscodeEditor yml={temp}></VscodeEditor> */}
      </div>
    </ChakraProvider>
  );
}

export default App;
