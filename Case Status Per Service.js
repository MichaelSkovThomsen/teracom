function removeDuplicates(a) {
	//Check all values in the incoming array and eliminate any duplicates
	var r = new Array(); //Create a new array to be returned with unique values
	//Iterate through all values in the array passed to this function
	o: for (var i = 0, n = a.length; i < n; i++) {
		//Iterate through any values in the array to be returned
		for (var x = 0, y = r.length; x < y; x++) {
			//Compare the current value in the return array with the current value in the incoming array
			if (r[x] == a[i]) {
				//If they match, then the incoming array value is a duplicate and should be skipped
				continue o;
			}
		}
		//If the value hasn't already been added to the return array (not a duplicate) then add it
		r[r.length] = a[i];
	}
	//Return the reconstructed array of unique values
	return r;
}

(function executeRule(current, previous /*null when async*/) {
	
	var testString = 'CaseStatusPerService - ' + current.getValue('number');
	
	/* Build array of objects with relevant data */
	var serviceObjectsArray = [];
	var parentsIDArray = [];
	var parentsInvolvedNameArray = [];
	
	
	/* Get related outages for case... */
	var filledEndCounter = 0;
	var notificationsCounter = 0;
	var noPauseNotificationCount = 0;
	var impactID = '';
	
	var outagesGR = new GlideRecord('cmdb_ci_outage');
	outagesGR.addQuery('u_case', current.getUniqueValue());
	/* Next line added 9-7-19 to filter out obsolete outages */
	outagesGR.addQuery('u_state', '!=', '2');
	outagesGR.query();
	
	testString += ' - related outages = ' + outagesGR.getRowCount().toString();
	
	var impactColor = '#ffffff';
	
	while (outagesGR.next()) {
		/* Object has to be defined within each iteration */
		var serviceObject = {};
			serviceObject.parent1Name = '';
			serviceObject.parent1Location = '';
			
			/* Child=actual level may be a top-level service */
			/* Hence parent is born with child-values */
			
			try {
				if (!gs.nil(outagesGR.getValue('cmdb_ci'))) {
					serviceObject.outageIDstring = outagesGR.getUniqueValue().toString();
					serviceObject.outageCategory = outagesGR.getDisplayValue('u_reference_1');
					serviceObject.outageServiceImpact = outagesGR.getDisplayValue('u_reference_2');
					impactID = outagesGR.getDisplayValue('u_reference_2');
					serviceObject.outageSafetyCritical = outagesGR.getDisplayValue('u_safety_critical');
					serviceObject.outageBegin = outagesGR.getDisplayValue('begin');
					serviceObject.outageEnd = outagesGR.getDisplayValue('end');
					/* 28-6-19: It may be neccesary also to stop pausing like this */
					/* serviceObject.pauseNotification = 'false'; */
					serviceObject.pauseNotification = outagesGR.getDisplayValue('u_pause_notification').replace('null', 'false');
					serviceObject.outageDetails = outagesGR.getValue('details');
					serviceObject.childIDstring = outagesGR.cmdb_ci.sys_id.toString();
					serviceObject.parentIDstring = outagesGR.cmdb_ci.sys_id.toString();
					serviceObject.parentName = outagesGR.getDisplayValue('cmdb_ci');
					serviceObject.parent1Name = outagesGR.getDisplayValue('cmdb_ci');
					
					testString += ' - try0: sO.outageCategory = ' + outagesGR.getDisplayValue('u_reference_1') + ' - sO.outageServiceImpact = ' + impactID + ' - sO.outageSafetyCritical = ' + outagesGR.getDisplayValue('u_safety_critical');
					
				}
			} catch (e) {
				gs.error('CaseStatusPerServiceError0: ' + e);
			}
			
			/* Get impact color - default is white */
			/* var impactColor = '#E6E6FA'; */
			impactColor = '#ffffff';
			if (!gs.nil(outagesGR.getValue('u_reference_2'))) {
				var impactGR = new GlideRecord('u_service_impact');
				impactGR.get(impactID);
				impactGR.query();
				
				if (impactGR.next()) {
					impactColor = impactGR.getValue('u_color');
				}
			}
			
			/* Override background color with noImpactColor, if outage is inactive (=> has end time) */
			/* Start with green */
			var noImpactColor = '#90EE90';
			var noImpactColorGR = new GlideRecord('u_service_impact');
			noImpactColorGR.addQuery('u_name', 'No impact');
			noImpactColorGR.query();
			
			if (noImpactColorGR.next()) {
				noImpactColor = noImpactColorGR.getValue('u_color');
			}
			
			if (serviceObject.outageEnd != '') {
				impactColor = noImpactColor;
			}
			
			serviceObject.impactColor = impactColor;
			
			var parent1GR = outagesGR.cmdb_ci.getRefRecord();
			
			/* Get related (parent) service, if outage has one */
			try {
                serviceObject.parentIDstring = parent1GR.getUniqueValue().toString();
                serviceObject.parentName = parent1GR.getValue('name');
                serviceObject.parent1Location = parent1GR.getDisplayValue('location').toString();
                serviceObject.parent1Name = parent1GR.getValue('name');
                testString += ' - try1: sO.parent1Location = ' + parent1GR.getDisplayValue('location') + ' - sO.parent1Name = ' + parent1GR.getValue('name');
				
			} catch (f) {
				gs.error('CaseStatusPerServiceError1: ' + f);
			}
            

            //var parent2GR = parent1GR.u_parent_service.getRefRecord(); //fungerer med service delivery points og andre, men ikke service offering
            if (parent1GR.getValue('u_parent_service'))
            {
                var parent2GR = parent1GR.u_parent_service.getRefRecord();
                gs.info("parent2GR is " + parent2GR);

            /* Get grandparent, if available */
            /* Two levels up should make sure to get to the top-service */
               try {	
				serviceObject.parentIDstring = parent2GR.getUniqueValue().toString();
				serviceObject.parentName = parent2GR.getValue('name');
				/*
				serviceObject.parent2Location = parent2GR.getDisplayValue('location').toString();
				serviceObject.parent2Name = parent2GR.getValue('name');
 				*/
			testString += ' - try2: sO.parentName = ' + parent2GR.getValue('name');
				
			} catch (g) {
				gs.error('CaseStatusPerServiceError2: ' + g);
            }
            }
            
            else
            {
            var parent3GR = parent1GR.parent.u_parent_service.getRefRecord(); // på service_offering er der en "parent" mellem CI og u_parent_service            
			/* Get grandparent, if available */
			/* Two levels up should make sure to get to the top-service */
			try {
				
				serviceObject.parentIDstring = parent3GR.getUniqueValue().toString();
				serviceObject.parentName = parent3GR.getValue('name');
				/*
				serviceObject.parent2Location = parent2GR.getDisplayValue('location').toString();
				serviceObject.parent2Name = parent2GR.getValue('name');
 				*/
			testString += ' - try2: sO.parentName = ' + parent3GR.getValue('name');
				
			} catch (h) {
				gs.error('CaseStatusPerServiceError3: ' + h);
			}
        }
			/* Update filledEndCounter for further calculations */
			serviceObject.filledEndCounter = filledEndCounter.toString();
			
			/* Retrieve top/parent-services */
			parentsIDArray.push(serviceObject.parentIDstring);
			serviceObjectsArray.push(serviceObject);
		}
		
		testString += ' - parentServices brutto: ' + parentsIDArray.length.toString();
		
		/* Getting unique parents */
		parentsIDArray = removeDuplicates(parentsIDArray);
		
		testString += ' - parentServices netto: ' + parentsIDArray.length.toString();
		testString += ' - objectsArray: ' + JSON.stringify(serviceObjectsArray);
		
		var parentName = '';
		
		for (i = 0; i < parentsIDArray.length; i++) {
			
			var serviceObjectsFilteredArray = [];
			var outagesToUpdateArray = [];
			filledEndCounter = 0;
			noPauseNotificationCount = 0;
			
			for (j = 0; j < serviceObjectsArray.length; j++) {
				
				if (parentsIDArray[i] == serviceObjectsArray[j].parentIDstring) {
					outagesToUpdateArray.push(serviceObjectsArray[j].outageIDstring);
					serviceObjectsFilteredArray.push(serviceObjectsArray[j]);
					parentName = serviceObjectsArray[j].parentName;
					
					if (serviceObjectsArray[j].outageEnd != '') {
						filledEndCounter++;
					}
					
					if (serviceObjectsArray[j].pauseNotification == 'false') {
						noPauseNotificationCount++;
					}
					
				}
				
			}
			
			/* Test conditions for sending notification on this top-service */
			
			testString += ' - outagesToUpdateArrayLength = ' + outagesToUpdateArray.length.toString() + ' - filledEndCounter = ' + filledEndCounter.toString() + ' - noPauseNotificationCount = ' + noPauseNotificationCount.toString();
			
			/* filledEndCounter not in use at the moment */
			
			if (noPauseNotificationCount > 0) {
				
				notificationsCounter++;
				gs.eventQueue('sn_customerservice.case_status_service_n', current, JSON.stringify(serviceObjectsFilteredArray), parentName);
				parentsInvolvedNameArray.push(parentName);
				
				/* If notification has been sent, then set update flag on outages with end time - and no other */
				
				for (l = 0; l < outagesToUpdateArray.length; l++) {
					var updateOutageGR = new GlideRecord('cmdb_ci_outage');
					updateOutageGR.get(outagesToUpdateArray[l]);
					updateOutageGR.query();
					
					if (updateOutageGR.next()) {
						if (updateOutageGR.getDisplayValue('end') != '') {
							/* Stop pausing 28-6-19 */
							/* updateOutageGR.u_pause_notification = true; */
							updateOutageGR.u_pause_notification = false;
							updateOutageGR.update();
						}
					}
				}
			}
		}
		
		var message = '';
		
		if (notificationsCounter > 1) {
			message = notificationsCounter.toString() + ' notifications have been sent to customer involving ' + parentsInvolvedNameArray.join(' / ');
		} else if (notificationsCounter == 1) {
			message = 'Notification has been sent to customer involving service ' + parentsInvolvedNameArray[0];
		} else {
			message = 'No notification has been sent, as none of the involved outages has changed to relevant/active status since last notification.';
		}
		
		gs.addInfoMessage(message);
		
		/* gs.info(testString); */
		
	})(current, previous);