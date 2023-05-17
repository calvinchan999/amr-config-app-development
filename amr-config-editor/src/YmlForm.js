// import "./App.css";
import React from "react";
import "./YmlForm.css";
import { Container } from "@chakra-ui/react";
function YmlForm(props) {
  return (
    <>
      <Container
        p={4}
        width={{ base: "100%", sm: "80%", md: "80%" }}
        fontSize={{ base: "24px", md: "25px", lg: "25px" }}
      >
        {props.html}
      </Container>
    </>
  );
}

export default YmlForm;
