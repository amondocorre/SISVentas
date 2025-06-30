$(document).on("ready", init);

///var objinit = new init();

var bandera = 1;

var detalleIngresos = new Array();

var detalleTraerCantidad = new Array();

elementos = new Array();

var email = "";
let initCargado = false;
//AgregatStockCant(21);

function init() {
  if (initCargado) return;
  initCargado = true;
    var total = 0.0;
    GetNextNumero();
    //GetTotal(19);

    $('#tblPedidos').dataTable({
        dom: 'Bfrtip',
        buttons: [
            'copyHtml5',
            'excelHtml5',
            'csvHtml5',
            'pdfHtml5'
        ]
    });

    var tablaArtPed = $('#tblArticulosPed').dataTable({
            "iDisplayLength": 4,
            "aLengthMenu": [2, 4]
        });
     

    ListadoPedidos();
    GetImpuesto();
    GetPrimerCliente();

    $("#VerForm").hide();
    $("#VerFormVentaPed").hide();

   // $("#btnAgregar").click(AgregarDetallePedPedido)
   // $("#cboTipoComprobante").change(VerNumSerie);
    $("#btnBuscarCliente").click(AbrirModalCliente);
    $("#btnBuscarDetIng").click(AbrirModalDetPed);
    $("form#frmVentas").submit(AbrirModalPagar);
    $("form#frmVentas2").submit(AbrirModalPagar2);
    $("#btnEnviarCorreo").click(EnviarCorreo);
    $("#btnNuevoVent").click(VerForm);
    $("#txtCodigoBarras").off("keydown").on("keydown", function(e) {
  if (e.key === "Enter") {
        e.preventDefault(); // Detiene la acción predeterminada (por ejemplo, el envío del formulario)
        buscarProductoByCodigo(); // Llama a tu función
      }
    });
    $("form#frmPedidos").submit(GuardarPedido);

    $("#btnGenerarVenta").click(GenerarVenta);

    $("#btnAgregarCliente").click(function(e){
		e.preventDefault();

		var opt = $("input[type=radio]:checked");
		$("#txtIdCliente").val(opt.val());
		$("#txtCliente").val(opt.attr("data-nombre"));
        email = opt.attr("data-email");

		$("#modalListadoCliente").modal("hide");
	});

	$("#btnAgregarArtPed").click(function(e){
		e.preventDefault();

		var opt = tablaArtPed.$("input[name='optDetIngBusqueda[]']:checked", {"page": "all"});
    

		opt.each(function() {
			AgregarDetallePed($(this).val(), $(this).attr("data-nombre"), $(this).attr("data-precio-venta"), "1", "0.0", $(this).attr("data-stock-actual"), $(this).attr("data-codigo"), $(this).attr("data-serie"));
		})
		
		$("#modalListadoArticulosPed").modal("hide");
	});
  function AbrirModalPagar(e){
    e.preventDefault();
    let totalDescuento = 0;
    let total = 0;
    let codigos = [];
    $("#modalPagar").modal("hide");
    $("#tblDetallePedido tbody tr").each(function() {
        let valor = parseFloat($(this).find("td").eq(5).text()) || 0;
        let valorT = parseFloat($(this).find("td").eq(3).text()) || 0;
        let codigo = parseFloat($(this).find("td").eq(1).text()) || '';
        //if(!codigos.includes(codigo)){
          codigos.push(codigo);
          total += valorT;
          totalDescuento += valorT*(valor/100) ;
          //suma += precio * (cantidad * (1 - (porcentaje / 100)));
        //}
    });
    if ($("#txtSerieVent").val() != "" && $("#txtNumeroVent").val() != "") {
      $.post("./ajax/PedidoAjax.php?op=verificarStock", {idPedido:$("#txtIdPedido").val()}, function(r){
        if(r){
          bootbox.alert(r);
          $("#modalPagar").modal("hide");
        }else{
          $("#modalPagar").modal("show");
          $("#descuentoInput").val((totalDescuento/2).toFixed(2));
          $("#valorInput").val((total/2).toFixed(2));
          $("#pagarInput").val(((total-totalDescuento)/2).toFixed(2));
        }
      })
    } else {
        bootbox.alert("Debe seleccionar un comprobante");
    }
  }
  function AbrirModalPagar2(e){
    e.preventDefault();
    let totalDescuento = 0;
    let total = 0;
    let codigos = [];
    $("#modalPagar").modal("hide");
    $("#tblDetallePedido tbody tr").each(function() {
        let valor = parseFloat($(this).find("td").eq(5).text()) || 0;
        let valorT = parseFloat($(this).find("td").eq(3).text()) || 0;
        let codigo = parseFloat($(this).find("td").eq(1).text()) || '';
        //if(!codigos.includes(codigo)){
          codigos.push(codigo);
          total += valorT;
          totalDescuento += valorT*(valor/100) ;
          //suma += precio * (cantidad * (1 - (porcentaje / 100)));
        //}
    });
    if ($("#txtSerieVent").val() != "" && $("#txtNumeroVent").val() != "") {
      $.post("./ajax/PedidoAjax.php?op=verificarStock", {idPedido:$("#txtIdPedido").val()}, function(r){
        if(r){
          bootbox.alert(r);
          $("#modalPagar").modal("hide");
        }else{
          $("#modalPagar").modal("show");
          $("#descuentoInput").val(totalDescuento.toFixed(2));
          $("#valorInput").val(total.toFixed(2));
          $("#pagarInput").val((total-totalDescuento).toFixed(2));
        }
      })
    } else {
        bootbox.alert("Debe seleccionar un comprobante");
    }
  }
    function FormVenta(total, idpedido){
        $("#VerFormVentaPed").show();
        $("#btnNuevo").hide();
        $("#VerForm").hide();
        $("#VerListado").hide();
        $("#txtTotalVent").val((total-0).toFixed(2));
        $("#txtIdPedido").val(idpedido);
        $("#lblTitlePed").html("Venta");
        //Ver();
    }

	function GuardarPedido(e){
        e.preventDefault();
    
        if ($("#txtIdCliente").val() != "") {
            if (elementos.length > 0) {
                var detalle =  JSON.parse(consultar());

                var data = { 
                    idUsuario : $("#txtIdUsuario").val(),
                    idCliente : $("#txtIdCliente").val(),
                    idSucursal : $("#txtIdSucursal").val(),
                    tipo_pedido : $("#cboTipoPedido").val(),
                    numero : $("#txtNumeroPed").val(),
                    detalle : detalle
                };
                
                $.post("./ajax/PedidoAjax.php?op=Save", data, function(r){
                           swal("Mensaje del Sistema", r, "success");
                           // delete this.elementos;
   
                            //$("#tblDetallePedido tbody").html("");
                            $("#txtIgvPed").val("");
                            $("#txtTotalPed").val("");
                            $("#txtSubTotalPed").val("");
                            OcultarForm();
                            $("#VerFormPed").hide();// Mostramos el formulario
                            $("#btnNuevoPedido").show();
                            Limpiar();
                            $("#txtCliente").val("");
                            ListadoVenta();
                            GetPrimerCliente();
                    
                });
            } else {
                bootbox.alert("Debe agregar articulos al detalle");
            }
        } else {
            bootbox.alert("Debe elegir un cliente");
        }

	}

    function EnviarCorreo(){
        bootbox.prompt({
            title: "Ingrese el correo para enviar el detalle de la compra",
            value: email,
            callback: function(result) {
                if (result !== null) {                                             
                    $.post("./ajax/VentaAjax.php?op=EnviarCorreo", {result:result, idPedido : $("#txtIdPedido").val()}, function(r){
                        bootbox.alert(r);
                    })                     
                } 
            }
        });
    }

    function GenerarVenta(e){
        e.preventDefault();
    
        if ($("#txtIdCliente").val() != "") {
            if (elementos.length > 0) {
                var detalle =  JSON.parse(consultar());

                var data = { 
                    idUsuario : $("#txtIdUsuario").val(),
                    idCliente : $("#txtIdCliente").val(),
                    idSucursal : $("#txtIdSucursal").val(),
                    tipo_pedido : "Pedido",
                    numero : $("#txtNumeroPed").val(),
                    detalle : detalle
                };
                
                $.post("./ajax/PedidoAjax.php?op=Save", data, function(r){
                            swal("Mensaje del Sistema", r, "success");
                            //delete this.elementos;
   
                            //$("#tblDetallePedido tbody").html("");
                            $("#txtIgvPed").val("");
                            $("#txtTotalPed").val("");
                            $("#txtSubTotalPed").val("");
                            Limpiar();
                            ListadoPedidos();
                            $.getJSON("./ajax/PedidoAjax.php?op=GetIdPedido", function(r) {
                                if (r) {
                                    GetTotal(r.idpedido);//inputMarca
                                    AgregatStockCant(r.idpedido);
                                    $("#VerFormVentaPed").show();
                                    $("#btnNuevo").hide();
                                    $("#VerForm").hide();
                                    $("#VerListado").hide();
                                    $("#lblTitlePed").html("Venta");
                                    $("#txtTotalVent").val((total-0).toFixed(2));
                                    var cli = $("#txtCliente").val();
                                    $("#txtClienteVent").val(cli);
                                    $("#txtIdPedido").val(r.idpedido);
                                    //$("#VerVentaDetallePedido").hide();
                                    $("#btnEnviarCorreo").hide();
                                    ComboTipoDoc();
                                    //$("#cboTipoComprobante").val("TICKET");
                                    $('table#tblDetallePedidoVer th:nth-child(4)').hide();
                                    $('table#tblDetallePedidoVer th:nth-child(8)').hide();

                                    $('table#tblDetallePedido th:nth-child(4)').hide();
                                    $('table#tblDetallePedido th:nth-child(8)').hide();
                                    $.post("./ajax/PedidoAjax.php?op=GetDetallePedido", {idPedido: r.idpedido}, function(r) {
                                            $("table#tblDetallePedidoVer tbody").html(r);
                                            $("table#tblDetallePedido tbody").html(r);
                                    })

                                }
                            });
                    
                });
            } else {
                bootbox.alert("Debe agregar articulos al detalle");
            }
        } else {
            bootbox.alert("Debe elegir un cliente");
        }
    }
    function Limpiar(){
        $("#txtIdCliente").val("");
        
        $("#cboTipoPedido").val("Pedido");
        $("#txtNumeroPed").val("");
        elementos.length = 0;
        $("#tblDetallePedido tbody").html("");
        GetNextNumero();
    }

    function GetTotal(idPedido) {
        $.getJSON("./ajax/PedidoAjax.php?op=GetTotal", {idPedido: idPedido}, function(r) {
                if (r) {
                    total = r.Total;
                    $("#txtTotalVent").val((total-0).toFixed(2));

                    var igvPed=total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val()));
                    $("#txtIgvPedVer").val(Math.round(igvPed*100)/100);

                    var subTotalPed=total - (total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val())));
                    $("#txtSubTotalPedVer").val(Math.round(subTotalPed*100)/100);

                    $("#txtTotalPedVer").val(Math.round(total*100)/100);
                }
        });
    }

    function GetNextNumero() {
        $.getJSON("./ajax/PedidoAjax.php?op=GetNextNumero", function(r) {
                if (r) {
                    $("#txtNumeroPed").val(r.numero);
                }
        });
    }

       
    function ComboTipoDoc2() {
        $.get("./ajax/PedidoAjax.php?op=listTipoDoc", function(r) {
                $("#cboTipoComprobante").html(r);
                $("#cboTipoComprobante").val("TICKET");
                VerNumSerie();
        })
    }
    async function ComboTipoDoc() {
        try {
          const tipoDocHTML = await $.get("./ajax/PedidoAjax.php?op=listTipoDoc");
          $("#cboTipoComprobante").html(tipoDocHTML);
          $("#cboTipoComprobante").val("TICKET");
          await VerNumSerie();
        } catch (error) {
          console.error("Error al cargar ComboTipoDoc:", error);
        }
      }

    function GetImpuesto() {

        $.getJSON("./ajax/GlobalAjax.php?op=GetImpuesto", function(r) {
                $("#txtImpuestoPed").val(r.porcentaje_impuesto);
                $("#SubTotal").html(r.simbolo_moneda + " Sub Total:");
                $("#IGV").html(r.simbolo_moneda +" " + r.nombre_impuesto+ " "  +r.porcentaje_impuesto + "%:");
                $("#Total").html(r.simbolo_moneda + " Total:"); 


                $("#txtImpuesto").val(r.porcentaje_impuesto);
                $("#SubTotal_Ver").html(r.simbolo_moneda + " Sub Total:");
                $("#IGV_Ver").html(r.simbolo_moneda +" " + r.nombre_impuesto+ " "  +r.porcentaje_impuesto + "%:");
                $("#Total_Ver").html(r.simbolo_moneda + " Total:"); 
            
        })
    }

   function VerNumSerie(){
    	var nombre = $("#cboTipoComprobante").val();
        var idsucursal = $("#txtIdSucursal").val();

            $.getJSON("./ajax/VentaAjax.php?op=GetTipoDocSerieNum", {nombre: nombre,idsucursal: idsucursal}, function(r) {
                if (r) {
                    $("#txtIdTipoDoc").val(r.iddetalle_documento_sucursal);
                    $("#txtSerieVent").val(r.ultima_serie);
                    $("#txtNumeroVent").val(r.ultimo_numero);
                } else {
                    $("#txtIdTipoDoc").val("");
                	$("#txtSerieVent").val("");
                    $("#txtNumeroVent").val("");
                }
            });

    }

    function VerForm(){
        $("#VerForm").show();
        $("#btnNuevoVent").hide();
        $("#cboTipoPedido").hide();
        $("#txtNumeroPed").hide();
        $("#inputTipoPed").hide();
        $("#inputNumero").hide();
        $('#btnRegPedido').hide();
        $("#VerListado").hide();
    }

    function OcultarForm(){
        $("#VerForm").hide();
        $("#btnNuevoVent").show();
        $("#VerListado").show();
    }

    function AbrirModalCliente(){
		$("#modalListadoCliente").modal("show");

		$.post("./ajax/PedidoAjax.php?op=listClientes", function(r){
            $("#Cliente").html(r);
            $("#tblClientees").DataTable();
        });
	}

	function AbrirModalDetPed(){
        $("#modalListadoArticulosPed").modal("show");
        var tabla = $('#tblArticulosPed').dataTable(
            {   "aProcessing": true,
                "aServerSide": true,
                "iDisplayLength": 4,
                //"aLengthMenu": [0, 4],
                "aoColumns":[
                        {   "mDataProp": "0"},
                        {   "mDataProp": "1"},
                        {   "mDataProp": "2"},
                        {   "mDataProp": "3"},
                        {   "mDataProp": "4"},
                        {   "mDataProp": "5"},
                        {   "mDataProp": "6"},
                        {   "mDataProp": "7"}

                ],"ajax": 
                    {
                        url: './ajax/PedidoAjax.php?op=listDetIng',
                        type : "get",
                        dataType : "json",
                         dataSrc: function(json){
                          return json.aaData.filter(item =>
                              item[4] > elementos.reduce((acum, e) => acum + (e[0] === item[8] ? e[3] : 0), 0)
                          );
                      },
                        error: function(e){
                            console.log(e.responseText);    
                        }
                    },
                "bDestroy": true,
                 "columnDefs": [
                  { "targets": 0, "width": "40px", "className": "text-center" },
                  { "targets": 1, "width": "100px", "className": "text-left" }
                 ],
            }).DataTable();
	}

    function AgregatStockCant(idPedido){ 
        
        $.ajax({
            url: './ajax/PedidoAjax.php?op=GetDetalleCantStock',
            dataType: 'json',
            data:{idPedido: idPedido},
            success: function(s){
                for(var i = 0; i < s.length; i++) {
                    AgregarDetalleCantStock(s[i][0],
                                    s[i][1],
                                    s[i][2]
                            ); 

                }
              //      Ver();                    
            },
            error: function(e){
               console.log(e.responseText); 
            }
        });        

    };

    function AgregarDetallePed(iddet_ing, nombre, precio_venta, cant, desc, stock_actual, codigo, serie) {
        var detalles = new Array(iddet_ing, nombre, precio_venta, cant, desc, stock_actual, codigo, serie);
        elementos.push(detalles);
        ConsultarDetallesPed();
    }    

    function consultar() {
        return JSON.stringify(elementos);
    }

    this.eliminar = function(pos){
        //var pos = elementos[].indexOf( 'c' );
        pos > -1 && elementos.splice(parseInt(pos),1);
        //this.elementos.splice(pos, 1);
        //console.log(this.elementos);
    };

    this.consultar = function(){
        /*
        for(i=0;i<this.elementos.length;i++){
            for(j=0;j<this.this.elementos[i].length;j++){
                console.log("Elemento: "+this.elementos[i][j]);
            }
        }
        */
        return JSON.stringify(elementos);
    };

};

function ListadoPedidos(){ 
            var tabla = $('#tblPedidos').dataTable(
            {   "aProcessing": true,
            "aServerSide": true,
            dom: 'Bfrtip',
                buttons: [
                    'copyHtml5',
                    'excelHtml5',
                    'csvHtml5',
                    'pdfHtml5'
                ],
            "aoColumns":[
                    {   "mDataProp": "0"},
                    {   "mDataProp": "1"},
                    {   "mDataProp": "2"},
                    {   "mDataProp": "3"},
                    {   "mDataProp": "4"},
                    {   "mDataProp": "5"},
                    {   "mDataProp": "6"}

            ],"ajax": 
                {
                    url: './ajax/PedidoAjax.php?op=list',
                    type : "get",
                    dataType : "json",
                    
                    error: function(e){
                        console.log(e.responseText);    
                    }
                },
            "bDestroy": true

        }).DataTable(); 
    };
function eliminarDetallePed(ele){
        objinit.eliminar(ele);
        ConsultarDetallesPed();
    }

function ConsultarDetallesPed() {
        $("table#tblDetallePedido tbody").html("");
        var data = JSON.parse(objinit.consultar());
        
        for (var pos in data) {

            $("table#tblDetallePedido").append("<tr><td>" + data[pos][1] + " <input class='form-control' type='hidden' name='txtIdDetIng' id='txtIdDetIng[]' value='" + data[pos][0] + "' /></td><td> " + data[pos][6] + "</td><td> " + data[pos][7] + "</td><td>" + data[pos][5]+ "</td><td><input class='form-control' type='text' name='txtPrecioVentPed' id='txtPrecioVentPed[]' value='" + data[pos][2] + "' onchange='calcularTotalPed(" + pos + ")' /></td><td><input class='form-control' type='text' name='txtCantidaPed' id='txtCantidaPed[]'  value='" + data[pos][3] + "' onchange='calcularTotalPed(" + pos + ")' disabled  /></td><td><input class='form-control' type='text' name='txtDescuentoPed' id='txtDescuentoPed[]' value='" + data[pos][4] + "' onchange='calcularTotalPed(" + pos + ")' /></td><td><button type='button' onclick='eliminarDetallePed(" + pos + ")' class='btn btn-danger'><i class='fa fa-remove' ></i> </button></td></tr>");
        }
        calcularIgvPed();
        calcularSubTotalPed();
        calcularTotalPed();
    }

    function calcularIgvPed(){
        var suma = 0;

        var data = JSON.parse(objinit.consultar());
        
        for (var pos in data) {
            //suma += parseFloat(data[pos][3] *  (data[pos][2] - data[pos][4]));
            var precio = parseFloat(data[pos][3]);
            var cantidad = parseFloat(data[pos][2]);
            var porcentaje = parseFloat(data[pos][4]);
            suma += precio * (cantidad * (1 - (porcentaje / 100)));
        }
        var igvPed=suma * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val()));
        $("#txtIgvPed").val(Math.round(igvPed*100)/100);
    }

    function calcularSubTotalPed(){
        var suma = 0;
        var data = JSON.parse(objinit.consultar());
        for (var pos in data) {
            //suma += parseFloat(data[pos][3] * (data[pos][2] - data[pos][4]));
            var precio = parseFloat(data[pos][3]);
            var cantidad = parseFloat(data[pos][2]);
            var porcentaje = parseFloat(data[pos][4]);
            suma += precio * (cantidad * (1 - (porcentaje / 100)));
        }
        var subTotalPed=suma - (suma * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val())));
        $("#txtSubTotalPed").val(Math.round(subTotalPed*100)/100);
    }

    function calcularTotalPed(posi){
       if(posi != null){
          ModificarPed(posi);
        }
        var suma = 0;
        var data = JSON.parse(objinit.consultar());
        for (var pos in data) {
            //suma += parseFloat(data[pos][3] * (data[pos][2] - data[pos][4]));
            var precio = parseFloat(data[pos][3]);
            var cantidad = parseFloat(data[pos][2]);
            var porcentaje = parseFloat(data[pos][4]);
            suma += precio * (cantidad * (1 - (porcentaje / 100)));
        }
        calcularIgvPed();
        calcularSubTotalPed();
        $("#txtTotalPed").val(Math.round(suma*100)/100);
        
    }

    function cargarDataPedido(idPedido, tipo_pedido, numero, Cliente, total, correo){
        bandera = 2;
        $("#VerForm").show();
        $("#btnNuevoVent").hide();
        $("#VerListado").hide();
        $("#txtIdPedido").val(idPedido);
        $("#txtCliente").hide();
        $("#cboTipoPedido").hide();
        email = correo;
        var igvPed=total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val()));
        $("#txtIgvPed").val(Math.round(igvPed*100)/100);

        var subTotalPed=total - (total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val())));
        $("#txtSubTotalPed").val(Math.round(subTotalPed*100)/100);

        $("#txtTotalPed").val(Math.round(total*100)/100);

        if (tipo_pedido == "Venta") {
            $.getJSON("./ajax/PedidoAjax.php?op=GetVenta", {idPedido:idPedido}, function(r) {
                if (r) {

                    $("#VerFormVentaPed").show();
                    $("#VerDetallePedido").hide();
                    $("#VerTotalesDetPedido").hide();
                    $("#inputTotal").hide();
                    $("#txtTotalVent").hide();
                    $("#VerRegPedido").hide();
                    $("#txtClienteVent").val(Cliente);
                    $("#txtSerieVent").val(r.serie_comprobante);
                    $("#txtNumeroVent").val(r.num_comprobante);
                    $("#cboTipoVenta").val(r.tipo_venta);
                    $("#cboTipoComprobante").html("<option>" + r.tipo_comprobante + "</option>");

                    var igvPed=r.total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val()));
                    $("#txtIgvPedVer").val(Math.round(igvPed*100)/100);

                    var subTotalPed=r.total - (r.total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val())));
                    $("#txtSubTotalPedVer").val(Math.round(subTotalPed*100)/100);

                    $("#txtTotalPedVer").val(Math.round(r.total*100)/100);
                    $("#txtVenta").html("Datos de la Venta");
                    $("#OcultaBR1").hide();
                    $("#OcultaBR2").hide();
                    $('button[type="submit"]').hide();
                    $('#btnGenerarVenta').hide();
                    $('#btnEnviarCorreo').show();
                }
                
            })
        };
        $("#txtNumeroPed").hide();

        $("#txtImpuestoPed").hide();
        $("#Porcentaje").hide();
        $("#btnBuscarCliente").hide();
        $("#btnBuscarDetIng").hide();

        $("#inputCliente").hide();
        $("#inputImpuesto").hide();
        $("#inputTipoPed").hide();
        $("#inputNumero").hide();
        
        CargarDetallePedido(idPedido);
        $("#cboTipoPedido").prop("disabled", true);
        $("#txtNumeroPed").prop("disabled", true);
        $("#txtCliente").prop("disabled", true);
        
        $('button[type="submit"]').hide();
        $('#btnGenerarVenta').hide();
        //$('button[type="submit"]').attr('disabled','disabled');
        $("#btnBuscarDetIng").prop("disabled", true);
        $("#btnBuscarCliente").prop("disabled", true);


        $("#cboFechaDesdeVent").hide();
        $("#cboFechaHastaVent").hide();
        $("#lblDesde").hide();
        $("#lblHasta").hide();
        $("#btnNuevoPedido").hide();
        $("#txtTotalVent").val((total-0).toFixed(2));
    }

    function CargarDetallePedido(idPedido) {
        //$('th:nth-child(2)').hide();
        //$('th:nth-child(3)').hide();
        $('table#tblDetallePedidoVer th:nth-child(4)').hide();
        $('table#tblDetallePedidoVer th:nth-child(8)').hide();

        $('table#tblDetallePedido th:nth-child(4)').hide();
        $('table#tblDetallePedido th:nth-child(8)').hide();

        $.post("./ajax/PedidoAjax.php?op=GetDetallePedido", {idPedido: idPedido}, function(r) {
                $("table#tblDetallePedidoVer tbody").html(r);
                $("table#tblDetallePedido tbody").html(r);
                //sumarDescuento();
        })
    }

    function cancelarPedido(idPedido){
       // alert(idPedido);
        
            //alert(detalleTraerCantidad[0]);
        bootbox.confirm("¿Esta Seguro de Anular la Venta?", function(result){

            if(result){
                
                $.ajax({
                    url: './ajax/PedidoAjax.php?op=TraerCantidad',
                    dataType: 'json',
                    data:{idPedido: idPedido},
                    success: function(s){
                        for(var i = 0; i < s.length; i++) {
                            //alert(s[i][0] + " - " + s[i][1]);
                            TraerCantidad(s[i][0], s[i][1]); 

                        }
                           var detalle =  JSON.parse(consultarCantidad());
                var data = {idPedido : idPedido, detalle: detalle};

                $.post("./ajax/PedidoAjax.php?op=CambiarEstado", data, function(e){
                    
                    swal("Mensaje del Sistema", e, "success");
                   //alert(e);
                    ListadoPedidos();
                    
                });
                                             
                    },

                    error: function(e){
                       console.log(e.responseText); 
                    }
                }); 
                 //Ver(); 
                

                detalleTraerCantidad.length = 0;
            }
            
        })
    }

    function TraerCantidad(iddet_ing, cantidad) {
        var detalle = new Array(iddet_ing, cantidad);
        detalleTraerCantidad.push(detalle);
    } 

    function eliminarPedido(idPedido){
        bootbox.confirm("¿Esta Seguro de eliminar el pedido?", function(result){
            if(result){
                $.post("./ajax/PedidoAjax.php?op=EliminarPedido", {idPedido : idPedido}, function(e){
                    
                    swal("Mensaje del Sistema", e, "success");
                    ListadoPedidos();
                    ListadoVenta();
                });
            }
            
        })
    }


    function VerMsj(){
        bootbox.alert("No se puede generar la venta, este pedido esta cancelado");
    }

    function ModificarPed(pos){
        var idDetIng = document.getElementsByName("txtIdDetIng");
        var pvd = document.getElementsByName("txtPrecioVentPed");
        var cantPed = document.getElementsByName("txtCantidaPed");
        var descPed = document.getElementsByName("txtDescuentoPed");
       // alert(pos);
       //elementos[pos][2] = $("input[name=txtPrecioVentPed]:eq(" + pos + ")").val();

        elementos[pos][0] = idDetIng[pos].value;
        elementos[pos][2] = pvd[pos].value;
        if (parseInt(cantPed[pos].value) <= elementos[pos][5]) {
            elementos[pos][3] = cantPed[pos].value;
            if (parseInt(cantPed[pos].value) <= 0) {
                bootbox.alert("<center>El Articulo " + elementos[pos][1] + " no puede estar vacio, menor o igual que 0</center>", function() {
                    elementos[pos][3] = "1";
                    cantPed[pos].value = "1";
                    calcularIgvPed();
                    calcularSubTotalPed();
                    calcularTotalPed();
                });
            }
        } else {
            bootbox.alert("<center>El Articulo " + elementos[pos][1] + " no tiene suficiente stock para tal cantidad</center>", function() {
                elementos[pos][3] = "1";
                cantPed[pos].value = "1";
                calcularIgvPed();
                calcularSubTotalPed();
                calcularTotalPed();
            });
        }
        
        elementos[pos][4] = descPed[pos].value;
        //alert(elementos[pos][3]);
        //alert(elementos[pos][0] + " - " + elementos[pos][2] + " - " + elementos[pos][3] + " - " + elementos[pos][4] + " - ");
        ConsultarDetalles();
    }

    function FormVenta(total, idpedido, total, Cliente, correo){
        $("#VerFormVentaPed").show();
        $("#btnNuevo").hide();
        $("#btnEnviarCorreo").hide();
        $("#VerListado").hide();
        $("#txtTotalVent").val((total-0).toFixed(2));
        $("#txtClienteVent").val(Cliente);
        $("#txtIdPedido").val(idpedido);
        email = correo;
        $("#lblTitlePed").html("Venta");
        ComboTipoDoc();
        CargarDetallePedido(idpedido);
        var igvPed=total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val()));
        $("#txtIgvPedVer").val(Math.round(igvPed*100)/100);

        var subTotalPed=total - (total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val())));
        $("#txtSubTotalPedVer").val(Math.round(subTotalPed*100)/100);

        $("#txtTotalPedVer").val(Math.round(total*100)/100);
        AgregatStockCant(idpedido);
    }


    function AgregatStockCant(idPedido){ 
        
        $.ajax({
            url: './ajax/PedidoAjax.php?op=GetDetalleCantStock',
            dataType: 'json',
            data:{idPedido: idPedido},
            success: function(s){
                for(var i = 0; i < s.length; i++) {
                    AgregarDetalleCantStock(s[i][0],
                                    s[i][1],
                                    s[i][2]
                            ); 

                }
              //      Ver();                    
            },
            error: function(e){
               console.log(e.responseText); 
            }
        });        

    };

    function Ver(){
        var data = JSON.parse(consultarCantidad());
        
                for (var pos in data) {
                    alert(data[pos][1]);
                }
    }


    function AgregarDetalleCantStock(iddet_ing, stock, cant) {
        var detalles = new Array(iddet_ing, stock, cant);
        detalleIngresos.push(detalles);
    } 

    function consultarCantidad() {
        return JSON.stringify(detalleTraerCantidad);
    };

    this.consultarCantidad = function(){
        return JSON.stringify(detalleTraerCantidad);
    };

    this.consultarDet = function(){
        return JSON.stringify(detalleIngresos);
    };

    function ComboTipoDoc() {

        $.get("./ajax/PedidoAjax.php?op=listTipoDoc", function(r) {
                $("#cboTipoComprobante").html(r);
        })
    }

    function AgregarPedCarrito(iddet_ing, stock_actual, art, cod, serie, precio_venta){
      ///const yaExiste = elementos.some(item => item[0] === iddet_ing); 
      if(false){
        bootbox.alert("El producto ya fue agregado anteriormente.");
        return;
      }
      const total =  Number(elementos.reduce((acum, e) => acum + Number(e[0] === iddet_ing ? e[3] : 0), 0))
      if (stock_actual > total) {
          var detalles = new Array(iddet_ing, art, precio_venta, "1", "0.0", stock_actual, cod, serie);
          elementos.push(detalles);
          ConsultarDetallesPed();
          $('#tblArticulosPed')
          .DataTable()
          .rows(function(idx, data, node) {
              const totalNew =  elementos.reduce((acum, e) => acum + Number(e[0] == data[8] ? e[3] : 0), 0)
              return (data[8] == iddet_ing && totalNew == data[4]); 
          })
          .remove()
          .draw();
      } else {
          bootbox.alert("No se puede agregar al detalle. No tiene stock");
      }
        
    }
    function buscarProductoByCodigo(){
        let codigo = $("#txtCodigoBarras").val();
        $.ajax({
          url: './ajax/PedidoAjax.php?op=getArticleByCodigo',
          dataType: 'json',
          data:{codigo: codigo},
          success: function(s){       
            if(s.status == 'success'){
              const articulos = s.data;
              var detalles = null;
              articulos.forEach(articulo => {
                const total =  Number(elementos.reduce((acum, e) => acum + Number(e[0] == articulo.iddetalle_ingreso,articulo ? e[3] : 0), 0)) 
                if(total<articulo.stock_actual){
                  detalles = new Array(articulo.iddetalle_ingreso,articulo.Articulo,articulo.precio_ventapublico,"1","0.0",articulo.stock_actual, articulo.codigo, articulo.serie); 
                }
              });
              if(detalles){
                elementos.push(detalles);
                $("#txtCodigoBarras").val('')
                ConsultarDetallesPed();
              }else{
                bootbox.alert("No cuentas con stock en el sistema.");
              } 
            } else{
              bootbox.alert("No se encontro el producto.");
            }  
          },
          error: function(e){
              
          }
        });
    }
    function buscarProductoByCodigo2(){
        let codigo = $("#txtCodigoBarras").val();
        const yaExiste = elementos.some(item => item[6] === codigo); 
        if (yaExiste) {
          bootbox.alert("El producto ya fue agregado anteriormente.");
          return;
        }
        $.ajax({
          url: './ajax/PedidoAjax.php?op=getArticleByCodigo',
          dataType: 'json',
          data:{codigo: codigo},
          success: function(s){       
            if(s.status == 'success'){
              const articulo = s.data;
              var detalles = new Array(articulo.iddetalle_ingreso,articulo.Articulo,articulo.precio_ventapublico,"1","0.0",articulo.stock_actual, articulo.codigo, articulo.serie); 
              elementos.push(detalles);
              $("#txtCodigoBarras").val('')
              ConsultarDetallesPed();
            } else{
              bootbox.alert("No se encontro el producto.");
            }  
          },
          error: function(e){
              
          }
        });
    }
    function GetPrimerCliente() {
      $.getJSON("./ajax/PedidoAjax.php?op=GetPrimerCliente", function(r) {
                if (r) {
                    $("#txtIdCliente").val(r.idpersona);
                    $("#txtCliente").val(r.nombre);
                }
        });
    }
