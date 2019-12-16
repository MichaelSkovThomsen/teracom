(
    function execute(inputs, outputs) 
    {
        var grparent = new GlideRecord('u_cmdb_ci_service');

        if (grparent.get('sys_id', inputs.parentSysId))
        {

                        var accountList = grparent.getValue('u_account_list');

                        if (!accountList)
                        {
                            accountList = [];
                        }
                        else
                        {
                            accountList = accountList.split(',');
                        }

                        var grServiceOffering = new GlideRecord('service_offering');

                        grServiceOffering.addQuery('parent', grparent.getUniqueValue());
                        grServiceOffering.query();

                        while (grServiceOffering.next())
                        {
                            var location = grServiceOffering.getValue('company');

                            if (accountList.indexOf(location) == -1)
                            {
                                grServiceOffering.setValue('u_support_status', 'unsupported');
                                grServiceOffering.update();
                            }
                        }               
            
        }
    }
)(inputs, outputs);
