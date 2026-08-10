import { createContext, useContext, useState } from 'react';

const LinkContext = createContext();

export const LinkProvider = ({ children }) => {
  const [linkMode, setLinkMode] = useState(false);
  const [itemId, setItemId] = useState(null);

  const clearLink = () => {
    setLinkMode(false);
    setItemId(null);
  };

  return (
    <LinkContext.Provider
      value={{
        linkMode,
        setLinkMode,
        itemId,
        setItemId,
        clearLink,
      }}
    >
      {children}
    </LinkContext.Provider>
  );
};

export const useLink = () => useContext(LinkContext);
