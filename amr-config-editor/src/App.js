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
  Box,
} from "@chakra-ui/react";
import YmlForm from "./YmlForm";
import { useDispatch, useSelector } from "react-redux";
// import VscodeEditor from "./VscodeEditor";

function App(props) {
  const { rules } = props.config;
  const dispatch = useDispatch();
  const toast = useToast();
  const toastIdRef = React.useRef();
  const [yamlValue, setYamlValue] = useState(null);
  const [formElements, setFormElements] = useState([]);

  const toastsData = useSelector((state) => state.toastMessagers);

  useEffect(() => {
    const getYaml = async () => {
      const response = await fetch("/node/api/amr-config");
      if (response.status === 200) {
        const text = await response.text();
        // console.log(text);
        // setTemp(text);
        setYamlValue(JSON.parse(text));
      } else {
        const message = {
          title: "Error",
          description: "Application-prod.yml not found",
          status: "error",
          duration: 3000,
          isClosable: true,
        };
        dispatch({ type: "ADD_TOAST", message });
      }
    };
    getYaml();
  }, []);

  useEffect(() => {
    const parseYamlToForm = (yamlObject, prefix = "") => {
      if (!yamlObject) {
        return [];
      }
      const elements = Object.entries(yamlObject).map(([key, value]) => {
        const disabled = rules?.[`${prefix}${key}`]?.disabled
          ? rules[`${prefix}${key}`]["disabled"]
          : false;
        const regexExpression = rules?.[`${prefix}${key}`]?.regexExpression
          ? rules[`${prefix}${key}`]["regexExpression"]
          : null;
        const formType = rules?.[`${prefix}${key}`]?.type
          ? rules[`${prefix}${key}`]["type"]
          : null;
        if (typeof value === "object" && !Array.isArray(value)) {
          const nestedElements = parseYamlToForm(value, `${prefix}${key}^`);

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
                type={formType ? formType : "text"}
                defaultValue={value}
                className="form-label"
                isDisabled={disabled}
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
                type={formType ? formType : "text"}
                isDisabled={disabled}
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
                isDisabled={disabled}
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
    const keys = key.split("^");
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
    // const { amr } = props.config;
    // const { endpoint } = amr;
    fetch(`/amr/api/actuator/restart`, {
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
            description: "Restarting",
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
            <Button colorScheme="red" variant="outline" size="md" onClick={onRestartAmr}>
              Reboot
            </Button>
            <Button colorScheme="blue" variant="outline" size="md" onClick={handleSubmit}>
              Save
            </Button>
            {/* <Box
              as='button'
              height='60px'
              width='60px'
              lineHeight='1.2'
              transition='all 0.2s cubic-bezier(.08,.52,.52,1)'
              border='1px'
              px='8px'
              borderRadius='2px'
              fontSize='14px'
              fontWeight='semibold'
              bg='#f5f6f7'
              borderColor='#ccd0d5'
              color='#4b4f56'
              _hover={{ bg: '#ebedf0' }}
              _active={{
                bg: '#dddfe2',
                transform: 'scale(0.98)',
                borderColor: '#bec3c9',
              }}
              _focus={{
                boxShadow:
                  '0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)',
              }}
            >
              Join Group
            </Box> */}
          </Stack>
        </div>
        {/* <VscodeEditor yml={temp}></VscodeEditor> */}
      </div>
    </ChakraProvider>
  );
}

export default App;
