
function validate(dbConn, jobInput) {
	var validationReq = toBeExecuted(jobInput);
	var exception = {};
	exception = {
		exceptionOccured: false,
		exceptionMessage: ""
	};
	if (validationReq) {
		// Write the validation logic.
		//If validation fails, set exception.exceptionOccured to true and set the exception.exceptionMessage to exception trace.
	}
	return exception;
}

function toBeExecuted(jobInput) {
	var loadIntoTA = jobInput.JsonString.Parameters.EnableTA.Value_Text;
	if (loadIntoTA === "01")
		return true;
	else
		return false;
}


function execute(dbConn, batchID, exception, jobInput, scheduleId, pipelineId) {
	var runId = jobInput.AuditLogID;
	var clearStaging = jobInput.JsonString.Parameters.ClearStage.Value_Text;
	var clearStage = '';
	if (clearStaging === '01') {
		clearStage = 'X';
	}
	try {
		var postProcess = dbConn.loadProcedure("SAP_HPH", "sap.hc.hph.plugins.textProcessing.ExampleTA.db.procedures::performCDWMapping");
		var result = postProcess(pipelineId, runId, scheduleId, clearStage);
	} catch (e) {
		$.trace.error("Exception!!" + e.toString());
		exception.exceptionOccured = true;
		exception.exceptionString = e.toString();
		
	} 
	return exception;
}

function rollback(dbConn, auditLogId, pipelineID){
	
	try{
		var rollbackProc = dbConn.loadProcedure("SAP_HPH", "sap.hc.hph.plugins.textProcessing.ExampleTA.db.procedures::DeleteCDWIntegration");
		rollbackProc(parseInt(auditLogId), pipelineID);
		var status = {};
		status.success = true;
		return status;
	}
	catch (e) {
		$.trace.error(e.toString());
		throw e;
	}
}