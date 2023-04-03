import React from "react";
import useSWR from "swr";
import {
  Box,
  Center,
  Heading,
  HStack,
  Skeleton,
  Stat,
  StatArrow,
  StatGroup,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
} from "@chakra-ui/react";
import FCWithAuth from "@/types/FCWithAuth";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import _ from "lodash";

const data = [
  { name: "03/01/23", auctions: 400, impressions: 300, revenue: 20 },
  { name: "03/02/23", auctions: 500, impressions: 400, revenue: 22 },
  { name: "03/03/23", auctions: 600, impressions: 500, revenue: 260 },
  { name: "03/04/23", auctions: 300, impressions: 200, revenue: 50 },
  { name: "03/05/23", auctions: 500, impressions: 400, revenue: 92 },
  { name: "03/06/23", auctions: 700, impressions: 400, revenue: 42 },
  { name: "03/07/23", auctions: 660, impressions: 400, revenue: 30 },
  { name: "03/08/23", auctions: 200, impressions: 100, revenue: 5 },
  { name: "03/09/23", auctions: 600, impressions: 550, revenue: 260 },
  { name: "03/10/23", auctions: 700, impressions: 500, revenue: 42 },
];

const renderLineChart = (
  <ResponsiveContainer width={"100%"} height={400}>
    <LineChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
    >
      <Line type="monotone" dataKey="auctions" stroke="#8884d8" />
      <Line type="monotone" dataKey="impressions" stroke="#82ca9d" />
      <Line type="monotone" dataKey="revenue" stroke="#ff7300" />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend
        verticalAlign="bottom"
        height={36}
        formatter={(val) => _.capitalize(val)}
      />
    </LineChart>
  </ResponsiveContainer>
);

const dashboardFetcher = async (key: string) => {
  const res = await fetch("/api/dashboard", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await res.json();
  return data;
};

const Dashboard: FCWithAuth = () => {
  const { data, error, isLoading } = useSWR("/api/dashboard", dashboardFetcher);
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
        <Stat w={"fit-content"}>
          <StatLabel>Auctions</StatLabel>
          <Skeleton isLoaded={!isLoading}>
            <StatNumber w={"auto"}>
              {error && <Text color={'tomato'}>Unavailable</Text>}
              {data?.auctionsCount}
            </StatNumber>
          </Skeleton>
          <StatHelpText>
            <StatArrow type="increase" />
            0.00%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Impressions</StatLabel>
          <StatNumber>0</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            0.00%
          </StatHelpText>
        </Stat>

        <Stat>
          <StatLabel>Revenue</StatLabel>
          <StatNumber>$0.00</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            0.00%
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
