import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RecentAct = () => {

    

    const activities = [
        { roll: "24NA10046", status: "Checked In", time: "10:00 AM" },
        { roll: "24NA10047", status: "Checked Out", time: "10:30 AM" },
        { roll: "24NA10048", status: "Checked In", time: "11:00 AM" },
        { roll: "24NA10049", status: "Checked Out", time: "11:30 AM" },
        { roll: "24NA10050", status: "Checked In", time: "12:00 PM" },
    ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Roll No</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {activities.map((entry, index) => (
                            <TableRow key={index}>
                                <TableCell>{entry.roll}</TableCell>
                                <TableCell
                                    className={entry.status === "Checked In" ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                                >
                                    {entry.status}
                                </TableCell>
                                <TableCell>{entry.time}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}

export default RecentAct
