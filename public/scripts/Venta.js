$(document).on("ready", init);// Inciamos el jquery

var email = "";

function init(){

    //Ver();
	$('#tblVentaPedido').dataTable({
        dom: 'Bfrtip',
        buttons: [
            'copyHtml5',
            'excelHtml5',
            'csvHtml5',
            'pdfHtml5'
        ]
    });

	ListadoVenta();// Ni bien carga la pagina que cargue el metodo
	ComboTipo_Documento();
    $("#VerFormPed").hide();
	$("#VerForm").hide();// Ocultamos el formulario
	//$("form#frmVentas").submit(SaveOrUpdate);// Evento submit de jquery que llamamos al metodo SaveOrUpdate para poder registrar o modificar datos
	//$("form#frmVentas").submit(AbrirModalPagar);
	$("#cboTipoComprobante").change(VerNumSerie);
	$("#btnNuevo").click(VerForm);// evento click de jquery que llamamos al metodo VerForm
    $("#btnNuevoPedido").click(VerFormPedido);
    $("form#frmCreditos").submit(SaveCredito);

    function ComboTipo_Documento() {

        $.get("./ajax/PedidoAjax.php?op=listTipoDoc", function(r) {
                $("#cboTipoComprobante").html(r);
            
        })
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
        if(!codigos.includes(codigo)){
          codigos.push(codigo);
          total += valorT;
          totalDescuento += valor;
        }
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
  

    function SaveCredito(e){
        e.preventDefault();// para que no se recargue la pagina
        $.post("./ajax/CreditoAjax.php?op=SaveOrUpdate", $(this).serialize(), function(r){// llamamos la url por post. function(r). r-> llamada del callback
            
                swal("Mensaje del Sistema", r, "success");
                $("#modalCredito").modal("hide");
                OcultarForm();
                ListadoVenta();
                ListadoPedidos();
        });
    }

    function GetIdVenta() {

        $.get("./ajax/CreditoAjax.php?op=GetIdVenta", function(r) {
                $("#txtIdVentaCred").val(r);
            
        })
    }

	function ComboTipoDocumentoS_N() {

        $.get("./ajax/VentaAjax.php?op=listTipo_DocumentoPersona", function(r) {
                $("#cboTipoDocumentoSN").html(r);
            
        })
    }

    

    function VerFormPedido(){
        $("#VerFormPed").show();// Mostramos el formulario
        $("#btnNuevoPedido").hide();// ocultamos el boton nuevo
        $("#btnGenerarVenta").hide();
        $("#VerListado").hide();// ocultamos el listado
        $("#btnReporte").hide();
    }

	function VerForm(){
		$("#VerForm").show();// Mostramos el formulario
		$("#btnNuevo").hide();// ocultamos el boton nuevo
		$("#VerListado").hide();// ocultamos el listado
		$("#btnReporte").hide();
	}

	function OcultarForm(){
		$("#VerForm").hide();// Mostramos el formulario
		$("#VerListado").show();// ocultamos el listado
		$("#btnReporte").show();
        $("#btnNuevo").show();
        $("#VerFormVentaPed").hide();
        $("#btnNuevoVent").show();
       // $("#lblTitlePed").html("Pedidos");
	}
	

     function LimpiarPedido(){
        $("#txtIdCliente").val("");
        $("#txtCliente").val("");
        
        $("#cboTipoPedido").val("Pedido");
        $("#txtNumeroPed").val("");
        elementos.length = 0;
        $("#tblDetallePedido tbody").html("");
        $("#txtSerieVent").val("");
        $("#txtNumeroVent").val("");
        GetNextNumero();
    }

    function GetNextNumero() {
        $.getJSON("./ajax/PedidoAjax.php?op=GetNextNumero", function(r) {
                if (r) {
                    $("#txtNumeroPed").val(r.numero);
                }
        });
    }


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
function ListadoVenta(){ 
        var tabla = $('#tblVentaPedido').dataTable(
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
                    {   "mDataProp": "4"}

            ],"ajax": 
                {
                    url: './ajax/VentaAjax.php?op=listTipoPedidoPedido',
                    type : "get",
                    dataType : "json",
                    
                    error: function(e){
                        console.log(e.responseText);    
                    }
                },
            "bDestroy": true

        }).DataTable(); 
    };

function eliminarVenta(id){// funcion que llamamos del archivo ajax/CategoriaAjax.php?op=delete linea 53
	bootbox.confirm("¿Esta Seguro de eliminar el Venta seleccionado?", function(result){ // confirmamos con una pregunta si queremos eliminar
		if(result){// si el result es true
			$.post("./ajax/VentaAjax.php?op=delete", {id : id}, function(e){// llamamos la url de eliminar por post. y mandamos por parametro el id 
                
				
				swal("Mensaje del Sistema", e, "success");

				location.reload();
            });
		}
		
	})
}
function calcularCambio(){
  let montoPagar = parseFloat($("#pagarInput").val()) || 0;
  let monto = parseFloat($("#montoInput").val()) || 0;
  if (monto >= montoPagar) {
      $("#cambioInput").val((monto - montoPagar).toFixed(2));
  } else {
      $("#cambioInput").val("0.00");
  }
}
 
function SaveOrUpdate(e){
  e.preventDefault();// para que no se recargue la pagina
  let monto = parseFloat($("#montoInput").val()) || 0;
  if(!monto || monto<=0){
    bootbox.alert("El monto recibido deber ser un valor mayor o igual al total a pagar.");
    return;
  }
  if ($("#txtSerieVent").val() != "" && $("#txtNumeroVent").val() != "") {
      var detalle =  JSON.parse(consultarDet());
      var data = { 
          idUsuario : $("#txtIdUsuario").val(),
          idPedido : $("#txtIdPedido").val(),
          tipo_venta : $("#cboTipoVenta").val(),
          iddetalle_doc_suc : $("#txtIdTipoDoc").val(),
          tipo_comprobante : $("#cboTipoComprobante").val(),
          serie_vent : $("#txtSerieVent").val(),
          num_vent : $("#txtNumeroVent").val(),
          impuesto : $("#txtImpuesto").val(),
          total_vent : $("#txtTotalVent").val(),
          detalle : detalle
      };

      $.post("./ajax/VentaAjax.php?op=SaveOrUpdate", data, function(r){// llamamos la url por post. function(r). r-> llamada del callback
          if ($("#cboTipoComprobante").val() == "TICKET") {
            guardarYImprimir();;
              //window.open("/lhome/Reportes/exTicket.php?id=" + $("#txtIdPedido").val(), '_blank');
          }
          if ($("#cboTipoVenta").val() == "Contado") {

              swal("Mensaje del Sistema", r, "success");

              /*
              $("#btnNuevoPedido").show();
              OcultarForm();
              ListadoVenta();
              ListadoPedidos();
              LimpiarPedido();

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
              });*/

              location.reload();
          } else {
              $("#btnNuevoPedido").show();
              bootbox.prompt({
                title: "Ingrese el correo para enviar el detalle de la compra",
                value: email,
                callback: function(result) {
                  if (result !== null) {   
                      $.post("./ajax/VentaAjax.php?op=EnviarCorreo", {result:result, idPedido : $("#txtIdPedido").val()}, function(r){
                        bootbox.alert(r);
                      }) 

                      bootbox.alert(r + ", Pasaremos a Registrar el Credito", function() {
                        $("#modalCredito").modal("show");
                        GetIdVenta();
                      });
                  } else {
                      bootbox.alert(r + ", Pasaremos a Registrar el Credito", function() {
                        $("#modalCredito").modal("show");
                        GetIdVenta();
                      });
                  }
                }
              });

          }
          location.reload();
      });
  } else {
      bootbox.alert("Debe seleccionar un comprobante");
  }
};
async function guardarYImprimir() {
  try {
    const id = $("#txtIdPedido").val();
    if (!id) throw new Error("ID de pedido no válido.");
    const data = await GetVentaById(id);
    await PrintTicket(data);
  } catch (error) {
    console.error("Error durante guardar e imprimir:", error);
  }
}
function pasarIdPedido(idPedido, total, correo){// funcion que llamamos del archivo ajax/CategoriaAjax.php linea 52
		$("#VerForm").show();// mostramos el formulario
		$("#VerListado").hide();// ocultamos el listado
        $("#btnNuevoPedido").hide();
        $("#VerTotalesDetPedido").hide();

		$("#txtIdPedido").val(idPedido);
		$("#txtTotalVent").val(total);
        email = correo;
        $("#cboTipoComprobante").val("TICKET");
        VerNumSerie();
        AgregatStockCant(idPedido);
        CargarDetallePedido(idPedido);
        var igvPed=total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val()));
        $("#txtIgvPed").val(Math.round(igvPed*100)/100);

        var subTotalPed=total - (total * parseInt($("#txtImpuesto").val())/(100+parseInt($("#txtImpuesto").val())));
        $("#txtSubTotalPed").val(Math.round(subTotalPed*100)/100);

        $("#txtTotalPed").val(Math.round(total*100)/100);
 	}
  function GetVentaById(idPedido) {
  return new Promise((resolve, reject) => {
    $.getJSON("./ajax/PedidoAjax.php?op=GetVentaById", { idPedido }, function(r) {
      resolve(r);
    }).fail(function(jqXHR, textStatus, errorThrown) {
      reject(new Error("Error al obtener la venta: " + textStatus));
    });
  });
}
async function PrintTicket(data) {
  const url = "https://ventas.local/printTicket";
  await $.ajax({
    url: url,
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data),
    success: function (r) {
      //console.log("Respuesta del servidor:", r);
    }
  });
}