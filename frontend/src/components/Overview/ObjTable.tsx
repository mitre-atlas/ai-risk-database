type ObjTableProps = {
  obj: {
    [key: string]: number | string;
  };
};

// Renders an object as a HTML table with key-value rows
export const ObjTable = ({ obj }: ObjTableProps) => {
  // Render table in alphabetical order by key
  const headers = Object.keys(obj).sort();

  const borderStyle = {
    border: "none",
    padding: "7px",
    paddingTop: "0px",  // To have top line align with the key
    paddingLeft: "0px", // To have the line start align with other values in Overview
    textAlign: "left",
  } as const;

  return (
    <table style={borderStyle}>
      <tbody>
        {headers.map(key => (
          <tr className="" key={key}>
            {/* Capitalized key matching the style of the Overview keys */}
            <th className="text-oslo-gray text-sm font-normal" style={borderStyle}>{key.charAt(0).toUpperCase() + key.slice(1)}</th>
            {/* Check for ISO Date strings.  If found, just render the date portion */}
            {/* Otherwise: Ensure booleans are rendered as true/false too by casting to String */}
            {/* Ensure dates are rendered as MM/DD/YYYY */}
            <td style={borderStyle}>
              {new String(obj[key]).indexOf(":") == 13 &&
              new String(obj[key]).indexOf("T") == 10
                ? new String(obj[key]).split("T")[0]
                : new String(obj[key])}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
