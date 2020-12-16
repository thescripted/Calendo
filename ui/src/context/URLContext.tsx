/**
 * Context for URL.
 * This is used to determine which endpoint the current user is on.
 */

import React from "react";

const URLContext = React.createContext(undefined);

function URLProvider(props) {
    let url = document.location;
    console.log(url);
    return <URLContext.Provider value={url} {...props} />;
}
export { URLContext, URLProvider };
