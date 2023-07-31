import React from "react";
import useSWR from "swr";
import {
  Box,
  Center,
  Heading,
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
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import _ from "lodash";
import fetcher from "@/helpers/fetcher";
import numeral from "numeral";

const data = [
  { name: "03/01/23", pageLoads: 400, impressions: 300, revenue: 20 },
  { name: "03/02/23", pageLoads: 500, impressions: 400, revenue: 22 },
  { name: "03/03/23", pageLoads: 600, impressions: 500, revenue: 260 },
  { name: "03/04/23", pageLoads: 300, impressions: 200, revenue: 50 },
  { name: "03/05/23", pageLoads: 500, impressions: 400, revenue: 92 },
  { name: "03/06/23", pageLoads: 700, impressions: 400, revenue: 42 },
  { name: "03/07/23", pageLoads: 660, impressions: 400, revenue: 30 },
  { name: "03/08/23", pageLoads: 200, impressions: 100, revenue: 5 },
  { name: "03/09/23", pageLoads: 600, impressions: 550, revenue: 260 },
  { name: "03/10/23", pageLoads: 700, impressions: 500, revenue: 42 },
];

const renderLineChart = (
  <ResponsiveContainer width={"100%"} height={400}>
    <LineChart
      width={600}
      height={300}
      data={data}
      margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
    >
      <Line type="monotone" dataKey="pageLoads" stroke="#8884d8" />
      <Line type="monotone" dataKey="impressions" stroke="#82ca9d" />
      <Line type="monotone" dataKey="revenue" stroke="#ff7300" />
      <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend
        verticalAlign="bottom"
        height={36}
        formatter={(val) =>
          val === "pageLoads" ? "Page Loads" : _.capitalize(val)
        }
      />
    </LineChart>
  </ResponsiveContainer>
);

type DashboardType = {
  impressionsCount: number;
  auctionsCount: number;
  clicksCount: number;
};

const Dashboard: FCWithAuth = () => {
  const { data, error, isLoading } = useSWR<DashboardType>(
    "/api/dashboard",
    fetcher
  );
  const ctr = () => {
    if (isLoading || !data || !data.impressionsCount) {
      return 0;
    } else {
      return (
        parseFloat(data.clicksCount.toString()) /
        parseFloat(data.impressionsCount.toString())
      );
    }
  };
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
          <StatLabel>Page Loads</StatLabel>
          <Skeleton isLoaded={!isLoading}>
            <StatNumber w={"auto"}>
              {error && <Text color={"tomato"}>Unavailable</Text>}
              {data && numeral(data.auctionsCount).format("0,0")}
            </StatNumber>
          </Skeleton>
          <StatHelpText>
            <StatArrow type="increase" />
            0.00%
          </StatHelpText>
        </Stat>

        <Stat w={"fit-content"}>
          <StatLabel>Impressions</StatLabel>
          <Skeleton isLoaded={!isLoading}>
            <StatNumber w={"auto"}>
              {error && <Text color={"tomato"}>Unavailable</Text>}
              {data && numeral(data.impressionsCount).format("0,0")}
            </StatNumber>
          </Skeleton>
          <StatHelpText>
            <StatArrow type="increase" />
            0.00%
          </StatHelpText>
        </Stat>

        <Stat w={"fit-content"}>
          <StatLabel>Clicks</StatLabel>
          <Skeleton isLoaded={!isLoading}>
            <StatNumber w={"auto"}>
              {error && <Text color={"tomato"}>Unavailable</Text>}
              {data && numeral(data.clicksCount).format("0,0")}
            </StatNumber>
          </Skeleton>
          <StatHelpText>
            <StatArrow type="increase" />
            0.00%
          </StatHelpText>
        </Stat>

        <Stat w={"fit-content"}>
          <StatLabel>CTR</StatLabel>
          <Skeleton isLoaded={!isLoading}>
            <StatNumber w={"auto"}>
              {error && <Text color={"tomato"}>Unavailable</Text>}
              {numeral(ctr()).format("0.00%")}
            </StatNumber>
          </Skeleton>
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
