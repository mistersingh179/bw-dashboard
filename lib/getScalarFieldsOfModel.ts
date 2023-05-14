import { Prisma } from "@prisma/client";

const getScalarFieldsOfModel = (modelName: string): string[] => {
  return (
    Prisma.dmmf.datamodel.models
      .find((x) => x.name === modelName)
      ?.fields.filter((x) => x.kind === "scalar")
      .map((x) => x.name) ?? []
  );
};

export default getScalarFieldsOfModel;
