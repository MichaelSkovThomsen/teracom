if (current.u_status == '0' || current.u_status == '4' || current.u_status == '7' ) {
	
    gs.addInfoMessage('Status is Draft, Executing or Pending. Cannot start measurement.');
    action.setRedirectURL(current);
    
    }
    
    else
    {
    
    var ecc_queue = new GlideRecord("ecc_queue");
    ecc_queue.initialize();
    
    //ecc_queue.agent = "mid.server.TEST-ETL-MID";
    var mid = gs.getProperty('etl.measurement.mid.server');
    ecc_queue.agent = "mid.server." + mid;
    //ecc_queue.name = "ecctest";
    ecc_queue.queue = "output";
    ecc_queue.topic = "Command";
    
    //parameters start
    var folder = 'C:\\scripts\\input.pl ';
    var id = current.u_id;
    var sn = current.u_service_delivery_point.u_parent_service.getDisplayValue();
    var loc = current.u_service_delivery_point.location.getDisplayValue();
    var cat = current.u_task.parent.subcategory;
    var wg = current.u_task.assignment_group.getDisplayValue();
    var sub = current.u_subsystem;
    var freq = current.u_service_delivery_point.u_string_frequency;
    var normdb = current.u_service_delivery_point.u_norm_probe_level;
    var normw = current.u_service_delivery_point.u_norm_power_level;
    var n1normdb = current.u_service_delivery_point.u_n_1_norm_probe_level;
    var tech = current.u_service_delivery_point.u_string_technology;
    var sitetype = current.u_service_delivery_point.u_service_object_type;
    var snuser = gs.getUserName();
    var etl = current.u_etl.u_dns_fqdn.getDisplayValue();
    
    // parameters end
    var command = folder + "'" + 'id=' + id + ';' + "sn=" + sn + ';' + "loc=" + loc + ';' + "cat=" + cat + ';' + "wg=" + wg + ';' + "sub=" + sub + ';' + "freq=" + freq + ';' + "normw=" + normw + ';' + "normdb=" + normdb + ';' + "n1normdb=" + n1normdb + ';' + "tech=" + tech + ';' + "sitetype=" + sitetype + ';' + "snuser=" + snuser + ';' + "etl=" + etl+ "';";
    
    //Command:
    //C:\scripts\input.pl 'id=WOT0010011-ETL0001009;sn=DAB Mux2;loc=Århus [aar];cat=maintenance_6mth_check_w._measurement;wg=FSØ;sub=;freq=232,49;normw=11.1;tech=DAB;sitetype=Main Site;snuser=admin_syspeople_MS;etl=etl1-aar.tekdom.local';
    
    // gs.log('command: ' + command);
    // gs.log('id: ' + id);
    // gs.log('sn: ' + sn);
    // gs.log('loc: ' + loc);
    // gs.log('cat: ' + cat);
    // gs.log('wg: ' + wg);
    // gs.log('sub: ' + sub);
    // gs.log('freq: ' + freq);
    // gs.log('normdb: ' + normdb);
    // gs.log('normw: ' + normw);
    // gs.log('n1normdb: ' + n1normdb);
    // gs.log('tech: ' + tech);
    // gs.log('sitetype: ' + sitetype);
    // gs.log('snuser: ' + snuser);
    // gs.log('etl: ' + etl);
    
    ecc_queue.payload = '<?xml version="1.0" encoding="UTF-8"?><parameters><parameter name="name" value="' + command + '"/></parameters>';
    
    //Get SysID of new ECC Queue record
    var ecc_sysid = ecc_queue.insert();
    
    //Set Response to current record sys_id
    ecc_queue.response_to = ecc_sysid;
    
    //Update new ECC Queue record
    ecc_queue.update();
    
    current.u_status = '7';
    current.update();
    
    action.setRedirectURL(current);
            
    }
    
    