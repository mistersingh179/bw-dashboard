import React from "react";
import { useSession } from "next-auth/react";
import {
  Box,
  Center,
  Heading,
  HStack,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  VStack,
} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer, Legend, Label,
} from "recharts";

const data = [
  { name: "03/01/23", auctions: 400, impressions: 300, amt: 20 },
  { name: "03/02/23", auctions: 500, impressions: 400, amt: 22 },
  { name: "03/03/23", auctions: 600, impressions: 500, amt: 260 },
  { name: "03/04/23", auctions: 300, impressions: 200, amt: 280 },
  { name: "03/05/23", auctions: 500, impressions: 400, amt: 32 },
  { name: "03/06/23", auctions: 700, impressions: 400, amt: 42 },
  { name: "03/07/23", auctions: 660, impressions: 400, amt: 30 },
  { name: "03/08/23", auctions: 200, impressions: 100, amt: 5 },
  { name: "03/09/23", auctions: 600, impressions: 600, amt: 260 },
  { name: "03/10/23", auctions: 700, impressions: 500, amt: 42 },
];

const renderLineChart = (
  <ResponsiveContainer width={'100%'} height={400}>
    <LineChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
    >
      <Line type="monotone" dataKey="auctions" stroke="#8884d8" />
      <Line type="monotone" dataKey="impressions" stroke="#82ca9d" />
      <Line type="monotone" dataKey="amt" stroke="#ff7300" />
      <CartesianGrid stroke="#ccc" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend verticalAlign="bottom" height={36}/>
    </LineChart>
  </ResponsiveContainer>
);

const Dashboard: FCWithAuth = () => {
  return (
    <Box>
      <Heading mt={5}>Dashboard</Heading>
      <Text mt={2} color={"gray.500"}>
        All important metrics at a glance
      </Text>
      <StatGroup
        mt={5}
        border={"1px"}
        borderColor={"gray.300"}
        boxShadow={"lg"}
        borderRadius={"lg"}
        p={5}
      >
        <Stat>
          <StatLabel>Auctions</StatLabel>
          <StatNumber>2,345,670</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            23.36%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Impressions</StatLabel>
          <StatNumber>1,876,536</StatNumber>
          <StatHelpText>
            <StatArrow type="decrease" />
            9.05%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Revenue</StatLabel>
          <StatNumber>$4,890</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            3.12%
          </StatHelpText>
        </Stat>
      </StatGroup>
      <Center
        w={"full"}
        mt={10}
        border={"1px"}
        borderColor={"gray.300"}
        boxShadow={"lg"}
        borderRadius={"lg"}
        p={5}
      >
        {renderLineChart}
      </Center>
    </Box>
  );
};

Dashboard.auth = true;

export default Dashboard;
