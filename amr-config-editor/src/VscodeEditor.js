import React, {useRef, useEffect, useState} from "react";
import Editor from "@monaco-editor/react";
function VscodeEditor(props) {
  const [value, setValue] = useState();
  const ref = useRef();
  const onUpdateYml = (v) => {
    ref.current = v;
  };

  useEffect(() => {
    console.log(props);
    setValue(props.yml)
  },[props])

  return (
    <>
      <Editor
        height="100vh"
        theme="vs-dark"
        language="yaml"
        defaultValue={value}
        onMount={(editor) => onUpdateYml(editor)}
      />
    </>
  );
}

export default VscodeEditor;
