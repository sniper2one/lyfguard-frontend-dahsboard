import { useState, Fragment, useMemo, useEffect } from "react";
import { Button, Card, Col, Row } from "react-bootstrap";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "reactstrap";
import logo11 from "../../assets/images/11.png";
import LystingTypeService from "../../services/MasterData/listingtype.service";
import DeleteModal from "../../utils/helpers/Modals/DeleteModal";
import ReactPaginate from "react-paginate";
import { useTable, usePagination, useSortBy } from 'react-table';
import { pagesToShowInitially } from "../../utils/Regex";
import {  API_PATHS } from "../../utils/constants/api.constants";
import EditModal from "../../utils/helpers/Modals/Editmodal";
import AmenitiesService from "../../services/MasterData/amenities.service";
import AmbulenceTypeService from "../../services/MasterData/ambulencetype.service";

const AmbulenceTypes = () => {
  const navigate = useNavigate();
  const [row,setRow] = useState()
  const [showModal, setShowModal] = useState(false);
  const [showModal1, setShowModal1] = useState(false);
  const [deleteId, setDeleteId] = useState("");
  const [editId, setEditId] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchInput, setSearchInput] = useState("");
  const [totalData, setTotalData] = useState(); 
  const [currentPage, setCurrentPage] = useState(1);

  const handleAdd = () => {
    navigate("/admin/add-ambulance-types");
  };

  const handleEdit = () => {
    navigate(`/admin/edit-ambulance-types/${editId._id}`,{
        state: { listing: editId },
    })
  };

  const handleEdit1 = (item) => {
    setShowModal1(true);
    setEditId(item)
  }

  const getData = async () => {
    try {
      let data = await AmbulenceTypeService.getAmbulenceTypes();  
     setRow(data?.data);
      setTotalData(data?.data?.length);
    } catch (error) {
      alert("Failed to fetch data");
      console.error("Failed to fetch data", error);
    }
  };
  
  const handleDelete1 = async () => {
    try {
      let data = await AmbulenceTypeService.deleteAmbulenceTypes({}, deleteId);
      getData();
      alert(data?.message || "Success");
      setTimeout(() => setShowModal(false), 1000);
    } catch (error) {
      setShowModal(false);
      alert("Failed to delete item");
      console.error("Failed to delete item", error);
    }
  };

  const handleDelete = (item) => {
    setShowModal(true);
    setDeleteId(item._id);
  };

  const handlePageChange = ({ selected }) => {
    const newPage = selected + 1;
    setCurrentPage(newPage);
    setSearch({ page: newPage }, { replace: true });
  };

  useEffect(() => {
    getData();
  },[])

 
  // Define columns for the react-table
  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "_id",
      },
      {
        Header: "Name",
        accessor: "name",
      },
      {
        Header: "Amenities",
        accessor: "amenities", // Change to access the amenities array
        Cell: ({ row }) => {
          const amenitiesList = row.original.amenities; // Access the amenities array
          
          // Map over amenities to get their names
          return (
            <div>
              {amenitiesList && amenitiesList.length > 0
                ? amenitiesList.map((amenity) => (
                    <div key={amenity._id}>{amenity.name}</div> // Display each amenity name
                  ))
                : "No Amenities"} {/* Handle case where there are no amenities */}
            </div>
          );
        },
      },
      {
        Header: "Image",
        accessor: "image",
        Cell: ({ row }) => {
          const imageUrl = row?.original?.image;
         
          return (
            <img
            crossorigin="anonymous" 
            src={API_PATHS.Apiurl + imageUrl} 
              alt="listing"
              style={{ maxWidth: "100px", maxHeight: "70px" }}
              onError={(e) => { e.target.src = logo11; }} // Handle broken image link
            />
          );
        },
      },
    
      {
        Header: "Action",
        Cell: ({ row }) => (
          <div>
            <Button
              variant="info"
              size="sm"
              onClick={() => handleEdit1(row.original)}
              className="me-2"
            >
              <i className="ri-pencil-line"></i>
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleDelete(row.original)}
            >
              <i className="ri-delete-bin-line"></i>
            </Button>
          </div>
        ),
      },
    ],
    []
  );


  const filteredData = useMemo(() => {
    return row?.filter((item) => {
      return (
        item.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        item.description.toLowerCase().includes(searchInput.toLowerCase())
      );
    });
  }, [row, searchInput]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData?.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  useEffect(() => {
    setTotalData(filteredData?.length);
  }, [filteredData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page, // Use `page` for pagination
  } = useTable(
    {
      columns,
      data: paginatedData || [],
      initialState: { pageIndex: 0, pageSize: itemsPerPage },
    },
    useSortBy,
    usePagination
  );

 
  return (

    <Fragment>
    <DeleteModal
      showModal={showModal}
      setShowModal={setShowModal}
      handleDelete={handleDelete1}
    />
     <EditModal
      showModal={showModal1}
      setShowModal={setShowModal1}
      handleEdit={handleEdit}
    />
    <div className="text-start mb-2 mt-5 ms-1" style={{ fontWeight: "800" }}>
      <Link to="/admin/dashboard">Dashboard</Link>&nbsp;&#8811;&nbsp; Ambulance Types
      
    </div>
    <Row>
      <Col xl={12}>
        <Card>
          <Card.Header className="d-flex justify-content-between">
            <Card.Title className="fw-bold fs-5 mt-2"> Ambulance Types</Card.Title>
            <div className="d-flex flex-wrap gap-2">
          
              <Button
                variant="primary"
                className="btn btn-md btn-wave custom-button"
                onClick={handleAdd}
              >   <i className="mdi mdi-clipboard-plus"></i> 
            Add  Ambulance Types
              </Button>
            </div>
          </Card.Header>
          <Card.Body className="p-3">
            <div className="d-flex justify-content-end mb-3">
              <span className="p-2 ">Search : </span>
              <Input
                type="text"
                placeholder="Search by  Name"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: "25%" }}
              />
            </div>
            <div className="table-responsive">
              <table {...getTableProps()} className="table text-nowrap">
                <thead className="thead-dark">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} className="text-center align-middle">
                      {headerGroup.headers.map((column) => (
                        <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                          {column.render("Header")}
                          <span>
                            {column.isSorted
                              ? column.isSortedDesc
                                ? " 🔽"
                                : " 🔼"
                              : ""}
                          </span>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {page.map((row) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()} className="text-center align-middle">
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
             {page.length ? <div className="d-flex align-items-center" style={{ marginBottom: "1rem" }}>
                <span className="me-2" style={{ fontSize: "16px", fontWeight: "bold" }}>
                  Show
                </span>
                <Input
                  type="select"
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  style={{ width: "80px", fontSize: "14px" }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={20}>20</option>
                </Input>
                <span className="ms-2" style={{ fontSize: "16px", fontWeight: "bold" }}>
                  entries
                </span>
              </div> :""}
              <div className="mr-5">
                {totalData / itemsPerPage > 1 && (
                  <div className="mt-5 d-flex justify-content-end align-right">
                    <ReactPaginate
                      previousLabel="<"
                      nextLabel=">"
                      breakLabel="..."
                      breakLinkClassName={"page-link"}
                      pageCount={Math.ceil(totalData / itemsPerPage)}
                      marginPagesDisplayed={1}
                      pageRangeDisplayed={pagesToShowInitially}
                      onPageChange={handlePageChange}
                      containerClassName="pagination"
                      activeClassName="active"
                      pageLinkClassName="page-link"
                      previousLinkClassName="page-link"
                      nextLinkClassName="page-link"
                      disabledClassName="disabled"
                      forcePage={currentPage - 1}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  </Fragment>
  );
};

export default AmbulenceTypes;
