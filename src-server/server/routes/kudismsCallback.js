import { KudiSmsController } from '../controllers'


const KudiRoutes = (router) => {
    router.post('/api/v1/dlr/kudisms',
        KudiSmsController.handleDeliveryReport
    );
    router.get('api/v1/dlr/kudisms', KudiSmsController.getAllReports);
    router.get('api/v1/dlr/kudisms/:id', KudiSmsController.getReportById);
}



export default KudiRoutes;