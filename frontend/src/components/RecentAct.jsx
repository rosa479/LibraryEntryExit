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

const RecentAct = ({ activities }) => {
    //writing the logic for 10 number of activities
    if(activities.length === 10) {
        activities.shift();
    }

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
                        {activities.slice().reverse().map((entry, index) => (
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
