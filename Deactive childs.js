(
    function execute(inputs, outputs) 
    {
        var grparent = new GlideRecord('u_cmdb_ci_service');

        if (grparent.get('sys_id', inputs.parentSysId))
        {
            var table = grparent.getValue('sys_class_name');
            var grGeneric = new GlideRecord(table);

            if (grGeneric.get('sys_id', grparent.getUniqueValue()))
            {
                switch (table)
                {
                    //service, deactivate SDPs
                    case "u_cmdb_ci_service_service":
                        var locationList = grGeneric.getValue('u_location_list');

                        if (!locationList)
                        {
                            locationList = [];
                        }
                        else
                        {
                            locationList = locationList.split(',');
                        }

                        var gru_cmdb_ci_service_delivery_point = new GlideRecord('u_cmdb_ci_service_delivery_point');

                        gru_cmdb_ci_service_delivery_point.addQuery('u_parent_service', grGeneric.getUniqueValue());
                        gru_cmdb_ci_service_delivery_point.query();

                        while (gru_cmdb_ci_service_delivery_point.next())
                        {
                            var location = gru_cmdb_ci_service_delivery_point.getValue('location');

                            if (locationList.indexOf(location) == -1)
                            {
                                gru_cmdb_ci_service_delivery_point.setValue('u_support_status', 'unsupported');
                                gru_cmdb_ci_service_delivery_point.update();
                            }
                        }
                        break;
                    //SDP, deacticate SMCs
                    case "u_cmdb_ci_service_delivery_point":

                        var componentObjectList = grGeneric.getValue('u_smc_object_list');

                        if (!componentObjectList)
                        {
                            componentObjectList = [];
                        }
                        else
                        {
                            componentObjectList = componentObjectList.split(',');
                        }

                        var gru_cmdb_ci_service_master_component = new GlideRecord('u_cmdb_ci_service_master_component');

                        gru_cmdb_ci_service_master_component.addQuery('u_service_delivery_point', grGeneric.getUniqueValue());
                        gru_cmdb_ci_service_master_component.query();

                        while (gru_cmdb_ci_service_master_component.next())
                        {
                            var comObj = gru_cmdb_ci_service_master_component.getValue('u_smc_scc_object');
                            if (componentObjectList.indexOf(comObj) == -1)
                            {
                                gru_cmdb_ci_service_master_component.setValue('u_support_status', 'unsupported');
                                gru_cmdb_ci_service_master_component.update();
                            }
                        }
                        break;
                    //SMC, deactivate SSCs
                    case "u_cmdb_ci_service_master_component":

                        var subComponentObjectList = grGeneric.getValue('u_ssc_object_list');
                        if (!subComponentObjectList)
                        {
                            subComponentObjectList = [];
                        }
                        else
                        {
                            subComponentObjectList = subComponentObjectList.split(',');
                        }

                        var gru_cmdb_ci_service_sub_component = new GlideRecord('u_cmdb_ci_service_sub_component');

                        gru_cmdb_ci_service_sub_component.addQuery('u_service_master_component', grGeneric.getUniqueValue());
                        gru_cmdb_ci_service_sub_component.query();

                        while (gru_cmdb_ci_service_sub_component.next())
                        {
                            var comObj = gru_cmdb_ci_service_sub_component.getValue('u_smc_scc_object');
                            gs.log("Claidate ssc:  " + subComponentObjectList.toString());

                            if (subComponentObjectList.indexOf(comObj) == -1)
                            {
                                gru_cmdb_ci_service_sub_component.setValue('u_support_status', 'unsupported');
                                gru_cmdb_ci_service_sub_component.update();
                            }
                        }
                        break;
                    default:
                        gs.error("class not recognized");
                        break;
                }
            }
        }
    }
)(inputs, outputs);
