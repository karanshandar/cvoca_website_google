import React from 'react';

interface SchemaMarkupProps {
  schema: object | object[];
}

/**
 * Component to inject JSON-LD structured data into the page
 * Accepts a single schema object or an array of schema objects
 */
const SchemaMarkup: React.FC<SchemaMarkupProps> = ({ schema }) => {
  const schemas = Array.isArray(schema) ? schema : [schema];

  return (
    <>
      {schemas.map((s, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
};

export default SchemaMarkup;
