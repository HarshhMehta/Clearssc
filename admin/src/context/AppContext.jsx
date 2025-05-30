import { createContext } from "react";
import React from 'react'


export const AppContext = createContext();

const AppContextProvider = (props) => {
  const currency = '$'
  
  return (
    <AppContext.Provider value={{ currency }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
