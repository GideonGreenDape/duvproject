import db from '../models';

const KudiSmsController = {
    async handleDeliveryReport(req, res) {
        try {
            const { status, api_reference, data, vendor } = req.body;

            if (!data || !data.recipient) {
                return res.status(400).json({ message: 'Invalid payload' });
            }

            await db.DeliveryReport.create({
                status,
                api_reference,
                code: data.code,
                cost: data.cost,
                recipient: data.recipient,
                time: data.time,
                network: data.network,
                country: data.country,
                description: data.description,
                vendor,
            });

            return res.status(200).json({ message: 'Delivery report received' });
        } catch (error) {
            console.error('Error saving delivery report:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },
    async getAllReports(req, res) {
        try {
            const { status, recipient } = req.query;

            const where = {};
            if (status) where.status = status;
            if (recipient) where.recipient = recipient;

            const reports = await db.DeliveryReport.findAll({
                where,
                order: [['time', 'DESC']],
            });

            const formatted = reports.map((r) => ({
                status: r.status,
                message: r.description,
                mobile: r.recipient,
                date: r.time,
            }));

            res.status(200).json(formatted);

        } catch (error) {
            console.error('Error fetching delivery reports:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },
    async getReportById(req, res) {
        try {
            const { id } = req.params;
            const report = await db.DeliveryReport.findByPk(id);

            if (!report) {
                return res.status(404).json({ message: 'Delivery report not found' });
            }

            return res.status(200).json(report);
        } catch (error) {
            console.error('Error fetching report by ID:', error);
            return res.status(500).json({ message: 'Server error' });
        }
    },
};



export default KudiSmsController;