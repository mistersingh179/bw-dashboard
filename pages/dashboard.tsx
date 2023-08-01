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
import { TotalNumbersType } from "@/pages/api/dashboard/totalNumbers";
import { ChartItemType } from "@/pages/api/dashboard/chart";
import { format, fromUnixTime, getUnixTime } from "date-fns";

const RenderLineChart = ({ data }: { data: ChartItemType[] }) => {
  const foo = data.map((x) => {
    return {
      ...x,
      time: getUnixTime(x.date),
      auctions: Number(x.auctions),
      impressions: Number(x.impressions),
      clicks: Number(x.clicks),
    };
  });

  console.log("***", foo);

  return (
    <ResponsiveContainer width={"100%"} height={400}>
      <LineChart
        width={600}
        height={300}
        data={foo}
        margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
      >
        <Line
          type="monotone"
          dataKey="auctions"
          stroke="#8884d8"
          name={"Page Loads"}
        />
        <Line
          type="monotone"
          dataKey="impressions"
          stroke="#82ca9d"
          name={"Impressions"}
        />
        <Line
          type="monotone"
          dataKey="clicks"
          stroke="#ff7300"
          name={"Clicks"}
        />
        <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
        <XAxis
          dataKey="time"
          type={"number"}
          domain={["auto", "auto"]}
          tickFormatter={(value) => format(fromUnixTime(value), "yyyy-MM-dd")}
        />
        <YAxis />
        <Tooltip
          labelFormatter={(x) => format(fromUnixTime(x), "yyyy-MM-dd")}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(val) =>
            val === "auctions" ? "Page Loads" : _.capitalize(val)
          }
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

const Dashboard: FCWithAuth = () => {
  const {
    data: totalNumbers,
    error,
    isLoading,
  } = useSWR<TotalNumbersType>("/api/dashboard/totalNumbers", fetcher);
  const { data: chart } = useSWR<ChartItemType[]>(
    "/api/dashboard/chart",
    fetcher
  );
  const ctr = () => {
    if (isLoading || !totalNumbers || !totalNumbers?.impressions) {
      return 0;
    } else {
      return (
        parseFloat(totalNumbers.clicks.toString()) /
        parseFloat(totalNumbers.impressions.toString())
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
              {totalNumbers && numeral(totalNumbers.auctions).format("0,0")}
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
              {totalNumbers && numeral(totalNumbers.impressions).format("0,0")}
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
              {totalNumbers && numeral(totalNumbers.clicks).format("0,0")}
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
        {chart && <RenderLineChart data={chart} />}
      </Center>
    </Box>
  );
};

Dashboard.auth = true;

export default Dashboard;
