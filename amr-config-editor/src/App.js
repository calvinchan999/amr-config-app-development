import "./App.css";
import React, { useState, useEffect } from "react";
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
  useToast,
} from "@chakra-ui/react";
import YmlForm from "./YmlForm";
import { useDispatch, useSelector } from "react-redux";
// import VscodeEditor from "./VscodeEditor";

function App(props) {
  console.log(props);
  const dispatch = useDispatch();
  const toast = useToast();
  const toastIdRef = React.useRef();
  const [yamlValue, setYamlValue] = useState(null);
  const [formElements, setFormElements] = useState([]);

  const toastsData = useSelector((state) => state.toastMessagers);

  useEffect(() => {
    const getYaml = async () => {
      const response = await fetch("/node/api/amr-config");
      const text = await response.text();
      // console.log(text);
      // setTemp(text);
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

  useEffect(() => {
    if (toastsData[0] != null) {
      const { payload } = toastsData[0];
      addToast(payload);
    }
  }, [toastsData]);

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
    fetch(`/node/api/amr-config`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(yamlValue),
    })
      .then((res) => {
        console.log(res);
        if (res.status === 200) {
          const message = {
            title: "Notification",
            description: "Configuration saved successfully",
            status: "success",
            duration: 3000,
            isClosable: true,
          };
          dispatch({ type: "ADD_TOAST", message });
        }
      })
      .catch((err) => {
        const message = {
          title: "Error",
          description: "Failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        };
        dispatch({ type: "ADD_TOAST", message });
      });
  };

  const onRestartAmr = () => {
    const { amr } = props.config;
    const { endpoint } = amr;
    fetch(`${endpoint}/amr/api/actuator/restart`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "",
    })
      .then((res) => {
        console.log(res);
        if (res) {
          const message = {
            title: "Notification",
            description: res.message,
            status: "success",
            duration: 3000,
            isClosable: true,
          };
          dispatch({ type: "ADD_TOAST", message });
        }
      })
      .catch(() => {
        const message = {
          title: "Error",
          description: "Failed",
          status: "error",
          duration: 3000,
          isClosable: true,
        };
        dispatch({ type: "ADD_TOAST", message });
      });
  };

  const addToast = (payload) => {
    const { message } = payload;
    if (message) {
      toastIdRef.current = toast(message);
    }
  };

  return (
    <ChakraProvider>
      <div className="app-container">
        <div className="chakra-yml-form">
          <YmlForm html={formElements}></YmlForm>
        </div>
        <div className="submit-btn">
          <Stack direction="column">
            <Button colorScheme="red" onClick={onRestartAmr}>
              Reboot
            </Button>
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
