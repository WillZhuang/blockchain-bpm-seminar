var address;
var contract;

whenEnvIsLoaded(function() {
    address = web3.eth.accounts[0]

    $('#my_address').text(address);
    getPossibleReceivers();

    $('#send_contract').on('click', function(e) {
        e.preventDefault();
        sendContract();
    });
    $('#send_payment').on('click', function(e) {
        e.preventDefault();
        sendPayment();
    });
    $('#send_analysis').on('click', function(e) {
        e.preventDefault();
        sendAnalysis();
    });
});

function getPossibleReceivers() {
    let select = $('#supplier_address');
    web3.eth.accounts.forEach(function(recvAddress, i) {
        if (recvAddress != address) {
            let opt = document.createElement('option');
            opt.value = recvAddress;
            opt.innerHTML = recvAddress;
            select.append(opt);
        }
    });
}

function sendContract() {
    let supplier_address = $('#supplier_address').val();
    console.log("sending contract");
    this.BearingsExchange.deploy([address, supplier_address], {gas:4000000}).then(function(bearingsexchange) {
        var transaction = web3.eth.sendTransaction({to: supplier_address, data: bearingsexchange.address});
        contract = bearingsexchange;
        console.log("new contract at", contract.address);
        contract.DoSendContract().then(e => {
            console.log(e.event, e.args);
            contract.sendContract("a contract", {gas: 400000})
        });
        contract.executeNext({gas:400000});
        contract.ContractSigned().then(e => showSignedContractSection(e.args));
        $('#send_contract, #supplier_address').prop("disabled", true);

        contract.BearingsSent().then(e => showBearingsSentSection(e.args));
        contract.ConfirmationSent().then(e => showConfirmationSentSection(e.args));
        contract.FineRequestSent().then(e => showFineRequestSentSection(e.args));
        contract.FinePayed().then(e => {
            showFinePayedSection(e.args);
            contract.executeNext({gas: 400000});
        });
        contract.CancellationSent().then(e => showContractCancelledSection(e.args));
        contract.ProcessFinished().then(e => showProcessFinished(e.args));
        contract.NotEnoughPayed().then(e => showWrongPaymentAmount(e.args));
    });
}

function showSignedContractSection(args) {
    $('#contract_signed_section').removeClass("hidden");
    $('#manufacturer__signer').text(args.sender);

    $('#pay_supplier_section').removeClass('hidden');
}

function sendPayment() {
    contract.sendPayment({value: "5000000000000000000", gas: 400000});
    $('#send_payment').prop("disabled", true);
}

function showBearingsSentSection() {
    $('#bearings_sent_section').removeClass('hidden');
}

function sendAnalysis() {
    contract.setFine($('#fine_amount').val(), {gas:400000}).then(function(transaction) {
        contract.executeNext({gas:400000});
    })
    $('#fine_amount, #send_analysis').prop("disabled", true);
}

function showWrongPaymentAmount(args) {
    $('#wrong_payment_sent').text(args.sent);
    $('#wrong_payment_required').text(args.required);
    $('#wrong_payment_amount_section').removeClass('hidden');
}

function showConfirmationSentSection() {
    $('#confirmation_sent_section').removeClass('hidden');
}

function showFineRequestSentSection() {
    $('#fine_request_sent_section').removeClass('hidden');
}

function showFinePayedSection() {
    $('#fine_payed_section').removeClass('hidden');
}

function showContractCancelledSection() {
    $('#contract_cancelled_section').removeClass('hidden');
}

function showProcessFinished() {
    $('#process_finished_section').removeClass('hidden');
}
